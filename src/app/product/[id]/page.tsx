import ProductSlider from "~/app/_components/ProductSlider/ProductSlider";
import type { ProductType } from "~/app/types/Products";

type Props = {
	params: {
		id: string;
	};
};


async function mockFetchProductById(id: string) {
	const product: ProductType = {
		title: "Dice",
		subtitle: "Configuration 14",
		price: 4110,
		ref: "DC-059",
		id: "table",
		imgNumber: 4,
	}

	return product
}

export default async function ProductPage({ params }: Props) {
	const product: ProductType = await mockFetchProductById(params.id);

	if (!product) {
		return <h1>Produit introuvable</h1>;
	}

	return (
		<div className="product-page">
			<ProductSlider product={product} />
		</div>
	);
}
