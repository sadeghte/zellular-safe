"use client";

import { useState } from "react";
import CustomButton from "../components/button";

export default function TestPage() {
	const [jsonInput, setJsonInput] = useState("");
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		try {
			const parsedJson = JSON.parse(jsonInput); // Validate JSON locally
			setError(null);

			// Optionally send to an API endpoint for processing
			const response = await fetch("/api/jsonrpc", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(parsedJson),
			});

			const data = await response.json();
			setResult(data);
		} catch (err) {
			setError("Invalid JSON format");
		}
	};

	return (
		<div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
			<h1>JSON Input Test</h1>
			<form onSubmit={handleSubmit}>
				<textarea
					rows={10}
					cols={50}
					value={jsonInput}
					onChange={(e) => setJsonInput(e.target.value)}
					placeholder="Enter your JSON here..."
					style={{ width: "100%", padding: "10px" }}
				/>
				<br />
				<CustomButton 
					variant="primary" 
					onClick={handleSubmit}
				>Primary Button</CustomButton>
			</form>
			{error && <p style={{ color: "red" }}>{error}</p>}
			{result && (
				<div style={{ marginTop: "20px" }}>
					<h2>Result</h2>
					<pre>{JSON.stringify(result, null, 2)}</pre>
				</div>
			)}
		</div>
	);
}
