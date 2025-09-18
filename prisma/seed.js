import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	const products = [
		{
			title: "Dice",
			subtitle: "Configuration 14",
			price: 4110,
			ref: "DC-059",
			identifier: "dice",
			imgNumber: 4,
			description:
				"Dans la collection TWIST, designée par Alexandre Dubreuil, voici la table d'appoint. Le compagnon idéal de votre canapé ou de votre fauteuil. Un élégant plateau en métal perforé qui tourne avec une fluidité parfaite au dessus d'une base en béton brut. Cette table d'appoint ou bout de canapé et parfaite pour un plateau repas devant un film ou pour y deposer un magazine ou votre tablette. Une simple pichenette et elle saura se faire oublier.",
		},
		{
			title: "Strut the pill",
			subtitle: "Table basse",
			price: 790,
			ref: "10133",
			identifier: "table",
			imgNumber: 3,
			description:
				"La table basse STRUT THE PILL est une création originale de l'éditeur français La Chance. Avec son design contemporain et épuré, cette table basse apporte une touche de modernité à tout espace de vie. Son plateau en verre trempé repose sur une structure en métal laqué, offrant à la fois robustesse et élégance. Disponible en plusieurs finitions, elle s'adapte parfaitement à différents styles de décoration intérieure. Que ce soit dans un salon, un bureau ou une salle d'attente, la table basse STRUT THE PILL se distingue par son esthétique raffinée et sa fonctionnalité pratique.",
		},
		{
			title: "Cloud 745",
			subtitle: "Support papier toilette",
			price: 115,
			ref: "DB-09104",
			identifier: "pq",
			imgNumber: 2,
			description:
				"Le porte-papier toilette CLOUD 745 est un accessoire de salle de bain au design moderne et fonctionnel. Conçu pour allier praticité et esthétique, ce support mural permet de maintenir le rouleau de papier toilette à portée de main tout en ajoutant une touche de style à votre espace. Fabriqué à partir de matériaux durables tels que l'acier inoxydable ou l'aluminium, le CLOUD 745 est résistant à l'humidité et facile à nettoyer. Son installation simple et rapide en fait un choix idéal pour toute salle de bain contemporaine.",
		},
		{
			title: "Twist",
			subtitle: "Tables d'appoint",
			price: 590,
			ref: "D-09400-PE-014",
			identifier: "twist",
			imgNumber: 4,
			description:
				"Dans la collection TWIST, designée par Alexandre Dubreuil, voici la table d'appoint. Le compagnon idéal de votre canapé ou de votre fauteuil. Un élégant plateau en métal perforé qui tourne avec une fluidité parfaite au dessus d'une base en béton brut. Cette table d'appoint ou bout de canapé et parfaite pour un plateau repas devant un film ou pour y deposer un magazine ou votre tablette. Une simple pichenette et elle saura se faire oublier.",
		},
	];

	for (const product of products) {
		await prisma.product.upsert({
			where: { ref: product.ref },
			update: {
				title: product.title,
				subtitle: product.subtitle,
				description: product.description,
				price: product.price,
				imgNumber: product.imgNumber,
				identifier: product.identifier,
			},
			create: {
				title: product.title,
				subtitle: product.subtitle,
				description: product.description,
				price: product.price,
				imgNumber: product.imgNumber,
				identifier: product.identifier,
				ref: product.ref,
			},
		});
	}

	const adminEmail = "admin@admin.com";
	const adminPassword = "root";

	const existingAdmin = await prisma.user.findUnique({
		where: { email: adminEmail }
	});

	if (!existingAdmin) {
		const hashedPassword = await hash(adminPassword, 12);

		await prisma.user.create({
			data: {
				email: adminEmail,
				name: "Administrateur",
				passwordHash: hashedPassword,
				role: "ADMIN",
				emailVerified: new Date(),
			}
		});

		console.log(`Admin created : ${adminEmail} / ${adminPassword}`);
	} else {
		console.log("Admin already created");
	}
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	}); 