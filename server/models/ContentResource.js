const { mongoose } = require('../config/mongodb');

const contentResourceSchema = new mongoose.Schema(
  {
    resource: {
      type: String,
      required: true,
      unique: true,
      enum: ['profile', 'experience', 'education', 'skills', 'projects', 'achievements', 'settings']
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    collection: 'content_resources',
    minimize: false,
    timestamps: true
  }
);

module.exports = mongoose.model('ContentResource', contentResourceSchema);
