# Heartoken

Système de vote de satisfaction avec suivi par appareil.

## Installation

```bash
npm install
npm run dev
```

## Utilisation

### Créer un appareil

- **Depuis le dashboard**: Utiliser le formulaire sur la page principale
- **Depuis l'API**: Voir ci-dessous

Une fois créé, copier l'ID de l'appareil depuis l'interface web.

## API

### Créer un appareil
```bash
POST /api/votes
{
  "action": "createDevice",
  "deviceName": "Reception"
}
```

### Envoyer un vote
```bash
POST /api/votes
{
  "deviceId": "device-id",
  "voteValue": 5
}
```