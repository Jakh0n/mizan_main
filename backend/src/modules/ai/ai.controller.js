'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const aiService = require('./ai.service');
const ApiError = require('../../utils/ApiError');

const parseText = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) throw ApiError.badRequest('text is required');
  const result = await aiService.processTranscript({
    workspaceId: req.workspaceId,
    text,
    createdBy: req.user._id,
  });
  return ApiResponse.ok(res, result, 'Message processed');
});

module.exports = { parseText };
