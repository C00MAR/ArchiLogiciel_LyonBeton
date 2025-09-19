type OrderItem = {
	title: string;
	subtitle: string;
	quantity: number;
	price: number;
};

interface OrderDetails {
	id: string;
	total: number;
	items: Array<OrderItem>;
}

interface OrderConfirmationProps {
	orderDetails: OrderDetails;
	customerName: string;
}

export default function OrderConfirmation(props: OrderConfirmationProps) {
	const { orderDetails, customerName } = props;
	const totalInEuros = (orderDetails.total / 100).toFixed(2);

	const text = `
Bonjour ${customerName},

Merci pour votre commande ! Votre paiement a été confirmé.

Détails de votre commande #${orderDetails.id} :

${orderDetails.items.map(item => `- ${item.title} (${item.subtitle}) x${item.quantity} = ${(item.price * item.quantity / 100).toFixed(2)}€`).join('\n')}

Total : ${totalInEuros}€

Nous traiterons votre commande dans les plus brefs délais et vous recevrez un email de confirmation d'expédition.

Cordialement,
L'équipe Lyon Béton
	`;

	const html = `
		<div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 24px;">
			<div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(17, 24, 39, 0.08);">
				<div style="background: linear-gradient(135deg, #346df1 0%, #4f80ff 100%); padding: 32px 20px; text-align: center;">
					<h1 style="color: #ffffff; margin: 0; font-size: 22px;">Confirmation de commande</h1>
				</div>

				<div style="padding: 32px 24px; color: #111827;">
					<p style="margin: 0 0 16px 0;">Bonjour <strong>${customerName}</strong>,</p>
					<p style="margin: 0 0 20px 0;">Merci pour votre commande ! Votre paiement a été confirmé avec succès.</p>

					<div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb;">
						<h3 style="margin: 0 0 16px 0; color: #374151;">Commande #${orderDetails.id}</h3>

						<table style="width: 100%; border-collapse: collapse;">
							<thead>
								<tr style="border-bottom: 2px solid #e5e7eb;">
									<th style="text-align: left; padding: 10px; color: #6b7280;">Produit</th>
									<th style="text-align: right; padding: 10px; color: #6b7280;">Quantité</th>
									<th style="text-align: right; padding: 10px; color: #6b7280;">Prix</th>
								</tr>
							</thead>
							<tbody>
								${orderDetails.items.map(item => `
									<tr style="border-bottom: 1px solid #e5e7eb;">
										<td style="padding: 10px;">
											<strong>${item.title}</strong><br>
											<small style="color: #6b7280;">${item.subtitle}</small>
										</td>
										<td style="text-align: right; padding: 10px;">${item.quantity}</td>
										<td style="text-align: right; padding: 10px;">${(item.price * item.quantity / 100).toFixed(2)}€</td>
									</tr>
								`).join('')}
							</tbody>
							<tfoot>
								<tr style="border-top: 2px solid #e5e7eb; font-weight: bold;">
									<td colspan="2" style="padding: 10px; text-align: right;">Total :</td>
									<td style="text-align: right; padding: 10px; font-size: 18px; color: #346df1;">${totalInEuros}€</td>
								</tr>
							</tfoot>
						</table>
					</div>

					<p style="margin: 0 0 8px 0;">Nous traiterons votre commande dans les plus brefs délais et vous recevrez un email de confirmation d'expédition.</p>
					<p style="margin: 0;">Si vous avez des questions, n'hésitez pas à nous contacter.</p>
					<p style="margin: 20px 0 0 0;">Cordialement,<br><strong>L'équipe Lyon Béton</strong></p>
				</div>

				<div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
					<p style="margin: 0;">Cet email a été envoyé suite à votre commande sur notre site.</p>
				</div>
			</div>
		</div>
	`;

	return { text, html };
} 