import { useState, useEffect } from "react";
import ItemCard from "../components/ItemCard";

const CommunityPage = () => {
	const [view, setView] = useState("all");
	const [isFavorited, setIsFavorited] = useState(false);
	const [items, setItems] = useState([]);

	useEffect(() => {
		const sampleItems = [
			{
				id: "1",
				name: "Item 1",
				description: "Description for item 1",
				photo: "https://via.placeholder.com/400",
				wantStatus: "have"
			},
			{
				id: "2",
				name: "Item 2",
				description: "Description for item 2",
				photo: "https://via.placeholder.com/400",
				wantStatus: "want"
			},
			{
				id: "3",
				name: "Item 3",
				description: "Description for item 3",
				photo: "https://via.placeholder.com/400",
				wantStatus: "dont_want"
			},
			{
				id: "4",
				name: "Item 4",
				description: "Description for item 4",
				photo: "https://via.placeholder.com/400",
				wantStatus: "have"
			},
		];
		setItems(sampleItems);
	}, []);

	const toggleFavorite = () => {
		setIsFavorited(!isFavorited);
	};

	// Filter items based on view
	const filteredItems = view === "all"
		? items
		: items.filter(item => item.wantStatus === view);

	const groupedItems = {
		have: items.filter(item => item.wantStatus === "have"),
		want: items.filter(item => item.wantStatus === "want"),
		dont_want: items.filter(item => item.wantStatus === "dont_want"),
	};

	return (
		<div style={{ padding: "20px" }}>
			<h1>My Item Collection</h1>

			<div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
				<select
					value={view}
					onChange={(e) => setView(e.target.value)}
					style={{ padding: "8px", borderRadius: "4px" }}
				>
					<option value="all">Community View</option>
					<option value="personal">Personal View</option>
				</select>

				<button
					onClick={toggleFavorite}
					style={{
						padding: "8px 16px",
						borderRadius: "4px",
						border: "none",
						backgroundColor: isFavorited ? "#ff4757" : "#2ed573",
						color: "white",
						cursor: "pointer"
					}}
				>
					{isFavorited ? "Favorited" : "Favorite"}
				</button>
			</div>

			//content
			{view === "all" ? (
				// View 1: Show all items in a grid
				<div style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
					gap: "20px"
				}}>
					{filteredItems.map(item => (
						<ItemCard key={item.id} item={item} />
					))}
				</div>
			) : (
				// personal view
				<div>
					<div style={{ marginBottom: "30px" }}>
						<h2>Have ({groupedItems.have.length})</h2>
						<div style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
							gap: "20px"
						}}>
							{groupedItems.have.map(item => (
								<ItemCard key={item.id} item={item} />
							))}
						</div>
					</div>

					<div style={{ marginBottom: "30px" }}>
						<h2>Want ({groupedItems.want.length})</h2>
						<div style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
							gap: "20px"
						}}>
							{groupedItems.want.map(item => (
								<ItemCard key={item.id} item={item} />
							))}
						</div>
					</div>

					<div style={{ marginBottom: "30px" }}>
						<h2>Don't Want ({groupedItems.dont_want.length})</h2>
						<div style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
							gap: "20px"
						}}>
							{groupedItems.dont_want.map(item => (
								<ItemCard key={item.id} item={item} />
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CommunityPage;