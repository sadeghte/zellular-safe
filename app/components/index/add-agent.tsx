"use client";

import { useState, useMemo, forwardRef, useImperativeHandle } from "react";
import CustomInput from "../input";
import CustomButton from "../button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchAgents, fetchWithdraws, selectDeposits } from "@/lib/features/custody/custodySlice";
import * as CustodyServiceApi from "@/lib/features/custody/custodyApi"
import Modal from "../modal";

interface AddAgentProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    disableTriggerBtn?: boolean,
    user: string,
}

export interface AddAgentRef {
    openModal: () => void;
}

const AddAgent = forwardRef<AddAgentRef, AddAgentProps>(({user, disableTriggerBtn}, ref) => {
    const dispatch = useAppDispatch();
    const [threshold, setThreshold] = useState(1)
    const [count, setCount] = useState(2)
    const [owners, setOwners] = useState(Array(count).fill(""))
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState("")

    // Expose the openModal method to the parent via ref
    useImperativeHandle(ref, () => ({
        openModal: () => setIsOpen(true),
    }));

    const handleThresholdChange = (e) => {
        const newValue = parseInt(e.target.value, 10);
        setThreshold(newValue);
    };

    const handleCountChange = (e) => {
        const newCount = parseInt(e.target.value, 10);

        if (newCount > owners.length) {
            // Add empty strings to match the new count
            // @ts-ignore
            setOwners([...owners, ...Array(newCount - owners.length).fill('')]);
        } else {
            // Trim the array to match the new count
            setOwners(owners.slice(0, newCount));
        }

        setCount(newCount);
    };

    const handleUpdateOwner = (index: number, value: string) => {
        const updatedOwners = [...owners];
        // @ts-ignore
        updatedOwners[index] = value;
        setOwners(updatedOwners);
    };

    const handleAddAgent = async (e: any) => {
        e.preventDefault();
        if(!user) {
            alert("AddAgent's user not selected")
            return;
        }

        if(threshold > count) {
            alert("Threshold cannot be grater than number of owners.")
            return
        }
        
        if(owners.findIndex(o => !o) >= 0){
            alert("Enter the owner address")
            return;
        }

        try {
            const result = await CustodyServiceApi.registerAgent(owners, threshold);
            alert("Agent registered, TX: " + result)
            dispatch(fetchAgents(user))
            setIsOpen(false)
        } catch (err) {
            setError("Error: " + err.message);
        }
    };

    return (
        <div>
            {!disableTriggerBtn && (
                <CustomButton
                    variant="primary"
                    onClick={() => setIsOpen(true)}
                >Add New Safe</CustomButton>
            )}

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="ownerCount">Threshold: </label>
                    <select
                        id="signersThreshold"
                        value={threshold}
                        onChange={handleThresholdChange}
                        style={{ marginLeft: '8px' }}
                    >
                        {[...Array(11).keys()].map((num) => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="ownerCount">Number of Owners: </label>
                    <select
                        id="ownerCount"
                        value={count}
                        onChange={handleCountChange}
                        style={{ marginLeft: '8px' }}
                    >
                        {[...Array(11).keys()].map((num) => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                </div>
                {owners.map((owner, index) => (
                    <div key={index} style={{ marginBottom: '8px' }}>
                        <input
                            type="text"
                            value={owner}
                            onChange={(e) => handleUpdateOwner(index, e.target.value)}
                            placeholder={`Owner ${index + 1}`}
                            style={{ marginRight: '8px', minWidth: '40ch' }}
                        />
                    </div>
                ))}
                {/* {JSON.stringify({ threshold, count, owners })} */}

                <CustomButton
                    variant="primary"
                    onClick={handleAddAgent}
                    style={{marginTop: "1rem", minWidth: "100%"}}
                >Add</CustomButton>
            </Modal>

        </div>
    );
});

AddAgent.displayName = "AddAgent"; // Set display name for debugging
export default AddAgent;