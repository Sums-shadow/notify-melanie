# Guide — Envoi du mail « Confirmation de parrainage » (partner-confirmation)

Ce guide explique comment envoyer l’e-mail de confirmation de parrainage avec le template **partner-confirmation**.

---

## 1. Endpoint et méthode

- **URL** : `POST http://localhost:3005/notify` (adapter l’hôte/port si besoin)
- **Header** : `Content-Type: application/json`

---

## 2. Corps de la requête (JSON)

Le template **partner-confirmation** utilise les variables suivantes dans `template.data` :

| Variable     | Type     | Obligatoire | Description |
|-------------|----------|-------------|-------------|
| `civilite`  | `string` | Non         | Civilité (ex. « Monsieur », « Madame ») |
| `name`      | `string` | Non         | Nom affiché (ex. nom complet) |
| `firstName` | `string` | Non         | Prénom |
| `lastName`  | `string` | Non         | Nom de famille |
| `year`      | `number` | Non         | Année dans le pied de page (ex. 2025) |

Au moins un des champs de nom (`name` ou `firstName`/`lastName`) est recommandé pour personnaliser le « Bonjour … ».

---

## 3. Exemple de requête complète

```json
{
  "service": "email",
  "recipients": {
    "email": "parrain@example.com"
  },
  "subject": "Confirmation de votre parrainage - Fondation MÉLANIE",
  "template": {
    "name": "partner-confirmation",
    "data": {
      "civilite": "Madame",
      "firstName": "Marie",
      "lastName": "Dupont",
      "year": 2025
    }
  },
  "text": "Bonjour Marie Dupont, nous vous confirmons la réception de votre formulaire de parrainage. L'équipe Fondation MÉLANIE vous recontactera très prochainement."
}
```

Avec uniquement un nom complet :

```json
{
  "service": "email",
  "recipients": { "email": "parrain@example.com" },
  "subject": "Confirmation de votre parrainage - Fondation MÉLANIE",
  "template": {
    "name": "partner-confirmation",
    "data": {
      "name": "Marie Dupont",
      "year": 2025
    }
  },
  "text": "Bonjour Marie Dupont, nous vous confirmons la réception de votre formulaire de parrainage."
}
```

---

## 4. Exemple cURL

```bash
curl -X POST http://localhost:3005/notify \
  -H "Content-Type: application/json" \
  -d '{
    "service": "email",
    "recipients": { "email": "parrain@example.com" },
    "subject": "Confirmation de votre parrainage - Fondation MÉLANIE",
    "template": {
      "name": "partner-confirmation",
      "data": {
        "civilite": "Madame",
        "firstName": "Marie",
        "lastName": "Dupont",
        "year": 2025
      }
    },
    "text": "Bonjour Marie Dupont, nous confirmons la réception de votre formulaire de parrainage. L'\''équipe Fondation MÉLANIE vous recontactera très prochainement."
  }'
```

---

## 5. Contenu du mail (aperçu)

Le mail envoyé contient notamment :

- Un en-tête « Fondation MÉLANIE »
- Une salutation personnalisée (Bonjour + civilité/nom selon les données)
- Un message de remerciement et de confirmation de réception du formulaire de parrainage
- Les prochaines étapes (contact de l’équipe, infos de paiement, lien pour choisir l’enfant)
- Ce que le parrain recevra après finalisation (confirmation, infos bénéficiaire, calendrier)
- Un pied de page avec l’année (variable `year`)

---

## 6. Réponse attendue

- **Succès (200)** : `"message": "email notification sent successfully"` avec les détails d’envoi.
- **Erreur de validation (400)** : vérifier que `service` est `"email"`, que `recipients.email` est une adresse valide, et que `template.name` est `"partner-confirmation"` avec un objet `template.data`.
- **Erreur serveur (500)** : consulter les logs du serveur (ex. problème SMTP).

Voir **USAGE.md** pour la configuration générale du serveur et du service e-mail.
