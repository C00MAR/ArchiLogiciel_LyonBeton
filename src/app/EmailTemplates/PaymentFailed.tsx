interface PaymentFailedDetails {
	id?: string;
	total?: number;
	customerEmail: string;
}

interface PaymentFailedProps {
	orderDetails: PaymentFailedDetails;
	customerName: string;
}

export default function PaymentFailed(props: PaymentFailedProps) {
	const { orderDetails, customerName } = props;

	const text = `
Bonjour ${customerName},

Nous vous informons qu'un problème est survenu lors du traitement de votre paiement.

${orderDetails.id ? `Commande concernée : #${orderDetails.id}` : ''}
${orderDetails.total ? `Montant : ${(orderDetails.total / 100).toFixed(2)}€` : ''}

Aucun montant n'a été débité de votre compte.

Vous pouvez réessayer votre commande à tout moment. Si le problème persiste, veuillez vérifier :
- Les informations de votre carte bancaire
- La limite de votre carte
- Contacter votre banque si nécessaire

N'hésitez pas à nous contacter si vous avez besoin d'aide.

Cordialement,
L'équipe Lyon Béton
	`;

	const html = `
		<div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 24px;">
			<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(17, 24, 39, 0.08);">
				<div style="background: linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%); padding: 32px 20px; text-align: center;">
					<h1 style="color: #ffffff; margin: 0; font-size: 22px;">Problème de paiement</h1>
				</div>

				<div style="padding: 32px 24px; color: #111827;">
					<p style="margin: 0 0 16px 0;">Bonjour <strong>${customerName}</strong>,</p>
					<p style="margin: 0 0 16px 0;">Nous vous informons qu'un problème est survenu lors du traitement de votre paiement.</p>

					${orderDetails.id || orderDetails.total ? `
					<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 16px; border-radius: 10px; margin: 20px 0;">
						${orderDetails.id ? `<p style=\"margin: 0 0 6px 0;\"><strong>Commande concernée :</strong> #${orderDetails.id}</p>` : ''}
						${orderDetails.total ? `<p style=\"margin: 0;\"><strong>Montant :</strong> ${(orderDetails.total / 100).toFixed(2)}€</p>` : ''}
					</div>
					` : ''}

					<p style="margin: 0 0 16px 0;"><strong>Aucun montant n'a été débité de votre compte.</strong></p>

					<p style="margin: 0 0 8px 0;">Vous pouvez réessayer votre commande à tout moment. Si le problème persiste, veuillez vérifier :</p>
					<ul style="margin: 0 0 16px 18px; color: #374151;">
						<li>Les informations de votre carte bancaire</li>
						<li>La limite de votre carte</li>
						<li>Contacter votre banque si nécessaire</li>
					</ul>

					<p style="margin: 0 0 16px 0;">N'hésitez pas à nous contacter si vous avez besoin d'aide.</p>

					<p style="margin: 0;">Cordialement,<br><strong>L'équipe Lyon Béton</strong></p>
				</div>

				<div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
					<p style="margin: 0;">Cet email a été envoyé suite à un problème de paiement sur notre site.</p>
				</div>
			</div>
		</div>
	`;

	return { text, html };
} 