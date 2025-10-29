import PropTypes from "prop-types";

const ItemCard = ({ item: { id, name, description, photo } }) => {
	return (
		<div>

			<div>
				<img src={photo !== "N/A" ? photo : "https://via.placeholder.com/400"} alt={name} />
			</div>

			<div>
				<h3>{name}</h3>
				<p>{description}</p>
			</div>
		</div>
	);
}

//Prop types
ItemCard.propTypes = {
	item: PropTypes.shape({
		id: PropTypes.string,
		name: PropTypes.string,
		description: PropTypes.string,
		photo: PropTypes.string,
	}),
};

export default ItemCard;