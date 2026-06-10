const { mongoose } = require('../config/mongodb');

const analyticsEventSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      required: true,
      enum: ['page_view', 'click']
    },
    path: String,
    section: String,
    target: String,
    label: String,
    referer: String,
    userAgent: String,
    createdAt: {
      type: String,
      required: true
    }
  },
  {
    collection: 'analytics_events',
    minimize: false,
    versionKey: false
  }
);

analyticsEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
