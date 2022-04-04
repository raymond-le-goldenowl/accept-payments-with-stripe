const cors = require("cors");
require("dotenv-safe").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SK);
// This is your test secret API key.
const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const YOUR_DOMAIN = "http://localhost:5500";

const storeItems = new Map([
	[1, { priceInCents: 10000, name: "Learn React Today" }],
	[2, { priceInCents: 20000, name: "Learn CSS Today" }],
]);

app.post("/create-checkout-session", async (req, res) => {
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "payment",
			line_items: req.body.items.map((item) => {
				const storeItem = storeItems.get(item.id);
				return {
					price_data: {
						currency: "usd",
						product_data: {
							name: storeItem.name,
						},
						unit_amount: storeItem.priceInCents,
					},
					quantity: item.quantity,
				};
			}),
			success_url: `${YOUR_DOMAIN}/success.html`,
			cancel_url: `${YOUR_DOMAIN}/cancel.html`,
		});
		return res.json(session);
	} catch (error) {
		console.log(error);
		return res.status(500).json(error.message);
	}
});

app.listen(4242, () => console.log("Running on port 4242"));
