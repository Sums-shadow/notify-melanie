# Documentation — Serveur Melanie Notification

Ce document décrit comment installer, configurer et utiliser le serveur de notifications **Melanie Notification**. Le serveur expose une API REST pour envoyer des notifications par **e-mail**, **SMS** (Twilio), **WhatsApp** (Twilio) et **Telegram**.

---

## Table des matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Démarrage du serveur](#démarrage-du-serveur)
5. [API — Endpoint `/notify`](#api--endpoint-notify)
6. [Exemples d’utilisation](#exemples-dutilisation)
7. [Templates e-mail (Handlebars)](#templates-e-mail-handlebars)
8. [Limitation de débit (rate limiting)](#limitation-de-débit-rate-limiting)
9. [Codes de réponse et erreurs](#codes-de-réponse-et-erreurs)

---

## Prérequis

- **Node.js** (version 14 ou supérieure recommandée)
- **npm** (fourni avec Node.js)

Pour les canaux optionnels :

- **E-mail** : un serveur SMTP (ex. Gmail, SendGrid, SMTP2GO)
- **SMS / WhatsApp** : compte [Twilio](https://www.twilio.com/) et numéro(s) configurés
- **Telegram** : un bot créé via [@BotFather](https://t.me/BotFather) et son token

---

## Installation

1. Cloner ou télécharger le projet, puis se placer dans le dossier :

```bash
cd melanie-notification
```

2. Installer les dépendances :

```bash
npm install
```

3. Créer un fichier d’environnement à partir de l’exemple :

```bash
cp en.env.example .env
```

4. Éditer `.env` et renseigner les variables selon les services que vous souhaitez activer (voir [Configuration](#configuration)).

---

## Configuration

Toutes les options sont lues depuis le fichier **`.env`** à la racine du projet. Vous pouvez vous baser sur **`en.env.example`**.

| Variable | Description | Exemple |
|----------|-------------|--------|
| `PORT` | Port d’écoute du serveur | `3000` |
| **E-mail** | | |
| `MAIL_ENABLED` | Activer l’envoi d’e-mails | `true` ou `false` |
| `MAIL_HOST` | Serveur SMTP | `smtp.gmail.com` |
| `MAIL_PORT` | Port SMTP (souvent 587 ou 465) | `587` |
| `MAIL_SECURE` | TLS (souvent `true` pour 465) | `false` |
| `MAIL_USER` | Utilisateur SMTP | `votre@email.com` |
| `MAIL_PASS` | Mot de passe / mot de passe d’application | `xxx` |
| `MAIL_FROM_ADDRESS` | Adresse et nom expéditeur | `"Nom <votre@email.com>"` |
| **SMS (Twilio)** | | |
| `SMS_ENABLED` | Activer les SMS | `true` ou `false` |
| `TWILIO_ACCOUNT_SID` | SID du compte Twilio | `ACxxxx...` |
| `TWILIO_AUTH_TOKEN` | Token d’authentification Twilio | `xxx` |
| `TWILIO_PHONE_NUMBER` | Numéro Twilio expéditeur (E.164) | `+33612345678` |
| **WhatsApp (Twilio)** | | |
| `WHATSAPP_ENABLED` | Activer WhatsApp | `true` ou `false` |
| `TWILIO_WHATSAPP_NUMBER` | Numéro WhatsApp Twilio | `whatsapp:+14155238886` |
| **Telegram** | | |
| `TELEGRAM_ENABLED` | Activer Telegram | `true` ou `false` |
| `TELEGRAM_BOT_TOKEN` | Token du bot (BotFather) | `123456:ABC-xxx` |
| `TELEGRAM_CHAT_ID` | Chat ID par défaut (optionnel si fourni dans la requête) | `123456789` |
| **Rate limiting** | | |
| `RATE_LIMIT_WINDOW_MS` | Fenêtre en millisecondes | `60000` (1 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Nombre max de requêtes par fenêtre | `100` |

- Pour **e-mail** : au moins un SMTP valide et `MAIL_ENABLED=true`.
- Pour **SMS** et **WhatsApp** : mêmes identifiants Twilio (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`) ; chaque canal a son propre numéro et son flag `*_ENABLED`.
- Pour **Telegram** : créer un bot avec @BotFather, récupérer le token, puis obtenir le `chat_id` (par exemple en envoyant un message au bot et en appelant `https://api.telegram.org/bot<TOKEN>/getUpdates`).

---

## Démarrage du serveur

Le point d’entrée est **`server.js`**. Démarrer le serveur avec Node :

```bash
node server.js
```

Vous devriez voir :

```text
Notification service listening on port 3000
```

Par défaut le port est **3000** sauf si `PORT` est défini dans `.env`.

---

## API — Endpoint `/notify`

- **URL** : `POST /notify`
- **Content-Type** : `application/json`
- **Corps** : un objet JSON dont la forme dépend du `service` choisi.

### Paramètres communs

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `service` | `string` | Oui | Canal : `"email"`, `"sms"`, `"whatsapp"` ou `"telegram"` |
| `recipients` | `object` | Oui | Un seul type de destinataire selon le service (voir ci-dessous) |

Dans `recipients`, **un et un seul** des champs suivants doit être présent selon le service :

| Service | Clé dans `recipients` | Format / Exemple |
|---------|------------------------|------------------|
| `email` | `email` | Adresse e-mail valide |
| `sms` | `phone` | E.164 : `"+33612345678"` |
| `whatsapp` | `whatsapp` | `"whatsapp:+33612345678"` |
| `telegram` | `telegramChatId` | ID de chat (nombre ou chaîne) |

### Paramètres par service

**E-mail (`service: "email"`)**

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `subject` | `string` | Oui | Objet de l’e-mail |
| `template` | `object` | Oui | Template Handlebars à utiliser |
| `template.name` | `string` | Oui | Nom du fichier sans `.hbs` (ex. `welcome`) |
| `template.data` | `object` | Oui | Données passées au template (ex. `{ "name": "Jean", "username": "jean" }`) |
| `text` | `string` | Non | Texte brut (version texte de l’e-mail) |

**SMS, WhatsApp, Telegram**

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `message` | `string` | Oui | Contenu du message envoyé |

Les champs `subject`, `template` et `text` sont interdits pour SMS/WhatsApp/Telegram. Pour l’e-mail, `message` est interdit.

---

## Exemples d’utilisation

### E-mail (avec template)

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "service": "email",
    "recipients": { "email": "destinataire@example.com" },
    "subject": "Bienvenue",
    "template": {
      "name": "welcome",
      "data": {
        "name": "Marie",
        "username": "marie42",
        "year": 2025
      }
    },
    "text": "Bienvenue Marie ! Ton identifiant est marie42."
  }'
```

### SMS

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "service": "sms",
    "recipients": { "phone": "+33612345678" },
    "message": "Votre code de vérification : 123456"
  }'
```

### WhatsApp

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "service": "whatsapp",
    "recipients": { "whatsapp": "whatsapp:+33612345678" },
    "message": "Bonjour, ceci est un message WhatsApp."
  }'
```

### Telegram

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "service": "telegram",
    "recipients": { "telegramChatId": "123456789" },
    "message": "Notification : votre commande a été expédiée."
  }'
```

Si `TELEGRAM_CHAT_ID` est défini dans `.env`, vous pouvez aussi envoyer à ce chat par défaut en fournissant le même `telegramChatId` dans la requête.

---

## Templates e-mail (Handlebars)

Les templates sont des fichiers **`.hbs`** dans le dossier **`templates/`**. Le nom envoyé dans `template.name` est le nom du fichier **sans** l’extension (ex. `welcome` pour `welcome.hbs`).

Exemple de structure dans `templates/welcome.hbs` :

```html
<h1>Bienvenue, {{name}} !</h1>
<p>Votre identifiant : <strong>{{username}}</strong></p>
<p>&copy; {{year}}</p>
```

Les variables (ex. `{{name}}`, `{{username}}`, `{{year}}`) sont fournies dans `template.data`. Vous pouvez ajouter d’autres fichiers `.hbs` et les référencer par leur nom dans `template.name`.

---

## Limitation de débit (rate limiting)

Un limiteur de requêtes est appliqué à l’API :

- **Fenêtre** : définie par `RATE_LIMIT_WINDOW_MS` (défaut : 60 000 ms, soit 1 minute).
- **Nombre max** : `RATE_LIMIT_MAX_REQUESTS` (défaut : 100 requêtes par fenêtre).

En cas de dépassement, le serveur répond avec un statut **429** et un message du type : *"Too many requests from this IP, please try again after some time."* Les en-têtes standard de rate limit sont renvoyés (`RateLimit-*`).

---

## Codes de réponse et erreurs

| Code | Signification |
|------|----------------|
| **200** | Notification envoyée avec succès (ou service désactivé / non configuré, selon les logs). |
| **400** | Erreur de validation (champs manquants, format incorrect, service non supporté). Le corps contient `message` et éventuellement `details` (Joi). |
| **429** | Trop de requêtes (rate limit). |
| **500** | Erreur serveur (SMTP, Twilio, Telegram, etc.). Le corps contient `message` et souvent `error`. |

Exemple de réponse 400 (validation) :

```json
{
  "message": "Validation error",
  "details": [
    {
      "message": "...",
      "path": ["recipients", "phone"],
      "type": "string.pattern.base"
    }
  ]
}
```

Exemple de réponse 200 (succès) :

```json
{
  "message": "email notification sent successfully",
  "details": { ... }
}
```

---

## Récapitulatif

1. **Installation** : `npm install` et copie de `en.env.example` vers `.env`.
2. **Configuration** : remplir `.env` pour les services utilisés (mail, Twilio, Telegram, rate limit).
3. **Démarrage** : `node server.js`.
4. **Envoi** : `POST /notify` avec un JSON valide selon le `service` et les règles de validation (un seul type de destinataire, champs requis selon le canal).
5. **Templates** : ajouter des `.hbs` dans `templates/` et les appeler via `template.name` et `template.data` pour les e-mails.

Pour toute question sur les formats (E.164, chat_id Telegram, etc.), se référer aux documentations officielles (Twilio, Telegram, Nodemailer).
