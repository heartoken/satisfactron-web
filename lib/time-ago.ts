export function timeAgoInFrench(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 5) {
    return "À l'instant"
  }
  
  if (seconds < 60) {
    return `Il y a ${seconds} secondes`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return minutes === 1 ? "Il y a 1 minute" : `Il y a ${minutes} minutes`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return hours === 1 ? "Il y a 1 heure" : `Il y a ${hours} heures`
  }

  const days = Math.floor(hours / 24)
  if (days < 7) {
    return days === 1 ? "Il y a 1 jour" : `Il y a ${days} jours`
  }

  const weeks = Math.floor(days / 7)
  if (weeks < 4) {
    return weeks === 1 ? "Il y a 1 semaine" : `Il y a ${weeks} semaines`
  }

  const months = Math.floor(days / 30)
  if (months < 12) {
    return months === 1 ? "Il y a 1 mois" : `Il y a ${months} mois`
  }

  const years = Math.floor(days / 365)
  return years === 1 ? "Il y a 1 an" : `Il y a ${years} ans`
}