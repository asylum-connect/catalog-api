import {Comment, Rating, Suggestion} from '../mongoose';
import {handleBadRequest, handleErr, handleNotFound} from '../utils';
import {getEntityQuery} from '../utils/query';

export const getComments = async (req, res) => {
	const {orgId, serviceId} = req?.params;
	const query = getEntityQuery({organizationId: orgId, serviceId});

	await Comment.findOne(query)
		.then((doc) => {
			const {comments = []} = doc || {};

			return res.json({comments});
		})
		.catch((err) => handleErr(err, res));
};

export const deleteCommentById = async (req, res) => {
	const {commentId} = req?.params;

	Comment.findByIdAndDelete(commentId)
		.then(() => {
			return res.json({deleted: true});
		})
		.catch((err) => {
			handleErr(err, res);
		});
};

export const updateComments = async (req, res) => {
	const {orgId, serviceId} = req?.params;
	const {comment, source, userId} = req?.body;
	const query = getEntityQuery({organizationId: orgId, serviceId});

	if (!comment) {
		return handleBadRequest(res);
	}

	await Comment.updateOne(
		query,
		{$push: {comments: {comment, source, userId}}},
		{upsert: true}
	)
		.then((doc) => {
			if (!doc) {
				return handleNotFound(res);
			}

			return res.json({updated: true});
		})
		.catch((err) => handleErr(err, res));
};

export const getRatings = async (req, res) => {
	const {orgId, serviceId} = req?.params;
	const query = getEntityQuery({organizationId: orgId, serviceId});

	await Rating.findOne(query)
		.then((doc) => {
			const {ratings = []} = doc || {};
			let average = ratings.reduce((result, {rating}) => {
				result += rating;

				return result;
			}, 0);

			average = Math.ceil(average / ratings.length);

			return res.json({average_rating: average, ratings});
		})
		.catch((err) => handleErr(err, res));
};

export const updateRatings = async (req, res) => {
	const {orgId, serviceId} = req?.params;
	const {rating, source, userId} = req?.body;
	const query = getEntityQuery({organizationId: orgId, serviceId});

	if (!rating) {
		return handleBadRequest(res);
	}

	await Rating.updateOne(
		query,
		{$push: {ratings: {rating, source, userId}}},
		{upsert: true}
	)
		.then((doc) => {
			if (!doc) {
				return handleNotFound(res);
			}

			return res.json({updated: true});
		})
		.catch((err) => handleErr(err, res));
};

export const createSuggestions = async (req, res) => {
	const {suggestions} = req?.body;

	const invalidSuggestions =
		suggestions?.length < 1 ||
		suggestions?.some(
			(suggestion) =>
				!suggestion?.organizationId ||
				!suggestion?.userEmail ||
				!suggestion?.field ||
				!suggestion?.value
		);

	if (!suggestions || invalidSuggestions) {
		return handleBadRequest(res);
	}

	await Suggestion.create(suggestions)
		.then((doc) => {
			if (!doc) {
				return handleNotFound(res);
			}

			return res.json({updated: true});
		})
		.catch((err) => handleErr(err, res));
};

export const getSuggestions = async (req, res) => {
	await Suggestion.find({})
		.then((suggestions) => {
			return res.json(suggestions);
		})
		.catch((err) => handleErr(err, res));
};

export const getUserSuggestionsByEmail = async (req, res) => {
	const {email} = req?.params;
	Suggestion.find({userEmail: email})
		.then((suggestions) => {
			return res.json(suggestions);
		})
		.catch((err) => {
			handleErr(err, res);
		});
};

export const deleteSuggestion = async (req, res) => {
	const {suggestionId} = req?.params;

	await Suggestion.findByIdAndDelete(suggestionId)
		.then(() => {
			return res.json({deleted: true});
		})
		.catch((err) => handleErr(err, res));
};
