const slugify = require("slugify");

// keeps `slug` derived from a source field (name / title) instead of every
// service re-doing it. pre("validate") so the slug exists before required runs.
// mongoose 9 middleware is promise based - no next() callback.
module.exports = (schema, { from }) => {
  schema.pre("validate", function () {
    if (this.isModified(from)) {
      this.slug = slugify(this[from], { lower: true });
    }
  });

  schema.pre("findOneAndUpdate", function () {
    const update = this.getUpdate() || {};
    const value = update[from] || (update.$set && update.$set[from]);
    if (value) {
      this.set({ slug: slugify(value, { lower: true }) });
    }
  });
};
