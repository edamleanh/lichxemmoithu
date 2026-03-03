import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

export const teamTelemetryService = {
  // A Set to keep track of names we've already logged in this browser session
  // This prevents spamming the database with the same names repeatedly while the user navigates
  sessionCache: new Set(),

  /**
   * Scans a list of matches and pushes unrecognized team names to Firebase.
   * This function fails silently and asynchronously to avoid interrupting the UI flow.
   * @param {Array} matches - The fetched array of match objects
   * @param {string} game - The esport type (e.g., 'lol', 'cs2', 'valorant')
   */
  async scanAndLogUnknownTeams(matches, game) {
    if (!matches || matches.length === 0) return

    // Wrap the extensive Firestore sync logic in requestIdleCallback 
    // so it only runs when the browser has finished painting tracking data
    const processTelemetry = async () => {
      try {
        const unknownTeams = new Set()

        matches.forEach(match => {
          if (match.home?.name && match.home.name !== 'TBD' && match.home.name !== 'Home') {
            const homeName = match.home.name.trim()
            if (!this.sessionCache.has(homeName)) {
              unknownTeams.add(homeName)
            }
          }

          if (match.away?.name && match.away.name !== 'TBD' && match.away.name !== 'Away') {
            const awayName = match.away.name.trim()
            if (!this.sessionCache.has(awayName)) {
              unknownTeams.add(awayName)
            }
          }
        })

          // Send batches to reduce DB roundtrips, but doing them individually is safest here
          // Check DB first to see which ones are truly missing
          const unknown_teams_ref = collection(db, 'unknown_teams')
          
          for (const teamName of unknownTeams) {
            const q = query(
              unknown_teams_ref, 
              where('name', '==', teamName),
              where('game', '==', game)
            )
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
               await addDoc(unknown_teams_ref, {
                 name: teamName,
                 game: game,
                 firstSeen: serverTimestamp(),
                 status: 'pending' 
               })
            }
          }
          
          if (unknownTeams.size > 0) {
              console.log(`[Telemetry] Synced ${unknownTeams.size} teams for ${game} in the background.`)
          }

        } catch (error) {
          console.warn('[Telemetry] Failed to sync teams:', error.message)
        }
      }

      // Use requestIdleCallback if available, fallback to setTimeout
      // This guarantees the React render and main thread are completely finished
      // before it starts querying Firebase.
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(processTelemetry)
      } else {
        setTimeout(processTelemetry, 2000)
      }
    }
}
