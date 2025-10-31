import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const CommunityCard = ({ item: { id, name, description, photo } }) => {
	const navigate = useNavigate();
	return (
		<div>

			<div>
				<img src={photo !== "N/A" ? photo : "https://via.placeholder.com/400"} alt={name} />
			</div>

			<div>
				<h3>{name}</h3>
				<p>{description}</p>
			</div>

			<button onClick={() => navigate("/" + name)}>View Community</button>
		</div>
	);
}

//Prop types
CommunityCard.propTypes = {
	item: PropTypes.shape({
		id: PropTypes.string,
		name: PropTypes.string,
		description: PropTypes.string,
		photo: PropTypes.string,
	}),
};

export default CommunityCard;