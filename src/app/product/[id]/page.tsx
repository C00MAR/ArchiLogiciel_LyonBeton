import ProductShop from "~/app/_components/ProductShop/ProductShop";
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
		description: "Dans la collection TWIST, designée par Alexandre Dubreuil, voici la table d'appoint. Le compagnon idéal de votre canapé ou de votre fauteuil. Un élégant plateau en métal perforé qui tourne avec une fluidité parfaite au dessus d'une base en béton brut. Cette table d'appoint ou bout de canapé et parfaite pour un plateau repas devant un film ou pour y deposer un magazine ou votre tablette. Une simple pichenette et elle saura se faire oublier.",
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
			<ProductShop product={product} />
		</div>
	);
}
