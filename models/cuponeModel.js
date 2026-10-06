const cuponeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [ true, "cupone name is required"],
            trim: true,
            unique: true,
            minlength: [3, "Too short cupone name"],
            maxlength: [32, "Too long cupone name"],
        },
        slug: {
            type: String,
            lowercase: true,
        },
        image: String,
    },
    { timestamps: true },
);
brandSchema.plugin(slugifyPlugin, { from: "name" });

module.exports = mongoose.model("cupone", cuponeSchema)