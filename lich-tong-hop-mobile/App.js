import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Linking,
  Platform,
  StatusBar,
  FlatList
} from 'react-native';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Calendar, Play, Trophy, RefreshCw, Sun, Moon, TrendingUp, MonitorPlay } from 'lucide-react-native';

// Services
import { ValorantAdapter } from './src/services/valorant';
import { LolAdapter } from './src/services/lol';
import { FootballAdapter } from './src/services/football';
import { PubgAdapter } from './src/services/pubg';
import { TftAdapter } from './src/services/tft';
import { Cs2Adapter } from './src/services/cs2';
import { teamTelemetryService } from './src/services/teamTelemetry';
import { fmtTime, shortenTeamName } from './src/utils/formatters';

const queryClient = new QueryClient();

const adapters = {
  valorant: ValorantAdapter,
  lol: LolAdapter,
  football: FootballAdapter,
  pubg: PubgAdapter,
  tft: TftAdapter,
  cs2: Cs2Adapter,
};

// Sports Config
const SPORTS_CONFIG = [
  { id: 'all', label: 'Tất cả', icon: TrendingUp },
  { id: 'football', label: 'Bóng Đá' },
  { id: 'lol', label: 'LOL' },
  { id: 'valorant', label: 'Valorant' },
  { id: 'cs2', label: 'CS2' },
  { id: 'pubg', label: 'PUBG' },
  { id: 'tft', label: 'TFT' },
];

const MatchCard = React.memo(function MatchCard({ match, isDarkMode }) {
  const isVideo = match.game === 'pubg' || match.game === 'tft';
  const handlePress = () => {
    if (isVideo && match.stream) {
      Linking.openURL(match.stream);
    }
  };

  const statusColors = {
    live: '#EF4444',
    upcoming: '#3B82F6',
    finished: '#10B981'
  };

  const bgStyle = isDarkMode ? styles.cardDark : styles.cardLight;
  const textPrimary = isDarkMode ? '#F3F4F6' : '#111827';
  const textSecondary = isDarkMode ? '#9CA3AF' : '#4B5563';

  return (
    <TouchableOpacity 
      activeOpacity={isVideo && match.stream ? 0.7 : 1}
      onPress={handlePress}
      style={[styles.card, bgStyle]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.gameName, { color: textPrimary, fontWeight: 'bold' }]}>
          {match.game.toUpperCase()}
        </Text>
        <Text style={[styles.leagueName, { color: textSecondary }]} numberOfLines={1}>
          {match.league}
        </Text>
        <Text style={[styles.timeText, { color: textSecondary }]}>
          {fmtTime(match.start)}
        </Text>
      </View>

      <View style={styles.cardBody}>
        {isVideo ? (
          <View>
            <Text style={[styles.videoTitle, { color: textPrimary }]}>{match.title || match.league}</Text>
            {match.stream && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <MonitorPlay size={14} color={statusColors[match.status] || '#888'} />
                <Text style={{ marginLeft: 4, color: statusColors[match.status] || '#888', fontSize: 12 }}>
                  {match.status === 'live' ? 'Bấm để xem LIVE' : 'Bấm để xem'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            {/* Home Team */}
            <View style={styles.teamRow}>
              <View style={styles.teamInfo}>
                {match.home?.logo ? (
                  <Image 
                    source={typeof match.home.logo === 'string' ? { uri: match.home.logo } : match.home.logo} 
                    style={styles.teamLogo} 
                  />
                ) : (
                  <View style={styles.logoPlaceholder} />
                )}
                <Text style={[styles.teamName, { color: textPrimary }]} numberOfLines={1}>
                  {shortenTeamName(match.home?.name) || 'TBD'}
                </Text>
              </View>
              {match.home?.score !== undefined && (
                <Text style={[styles.score, { color: textPrimary }]}>{match.home.score}</Text>
              )}
            </View>

            {/* Away Team */}
            <View style={[styles.teamRow, { marginTop: 8 }]}>
              <View style={styles.teamInfo}>
                {match.away?.logo ? (
                  <Image 
                    source={typeof match.away.logo === 'string' ? { uri: match.away.logo } : match.away.logo} 
                    style={styles.teamLogo} 
                  />
                ) : (
                  <View style={styles.logoPlaceholder} />
                )}
                <Text style={[styles.teamName, { color: textPrimary }]} numberOfLines={1}>
                  {shortenTeamName(match.away?.name) || 'TBD'}
                </Text>
              </View>
              {match.away?.score !== undefined && (
                <Text style={[styles.score, { color: textPrimary }]}>{match.away.score}</Text>
              )}
            </View>
          </View>
        )}
      </View>

      {match.status === 'live' && (
        <View style={styles.liveIndicator}>
          <Play size={12} fill="#EF4444" color="#EF4444" />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

function MainContent() {
  const [activeSport, setActiveSport] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { data: matches = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['matches', activeSport],
    queryFn: async () => {
      const now = new Date();
      const standardFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const standardTo = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const extendedFrom = new Date(standardFrom); extendedFrom.setDate(extendedFrom.getDate() - 1);
      const extendedTo = new Date(standardTo); extendedTo.setDate(extendedTo.getDate() + 2);

      const measureFetch = async (name, adapter, args) => {
        const start = Date.now();
        try {
          const res = await adapter.fetch(args);
          console.log(`⏱️ [API] ${name} tải xong trong ${Date.now() - start}ms (${res?.length || 0} trận)`);
          return res;
        } catch (e) {
          console.log(`❌ [API] ${name} lỗi sau ${Date.now() - start}ms:`, e.message);
          throw e;
        }
      };

      let allMatches = [];

      if (activeSport === 'all') {
        console.log('\n--- BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU TỔNG ---');
        const startAll = Date.now();
        const results = await Promise.allSettled([
          measureFetch('Valorant', adapters.valorant, { from: standardFrom, to: standardTo }),
          measureFetch('PUBG', adapters.pubg, { from: extendedFrom, to: extendedTo }),
          measureFetch('TFT', adapters.tft, { from: extendedFrom, to: extendedTo }),
          measureFetch('LOL', adapters.lol, { from: standardFrom, to: standardTo }),
          measureFetch('Football', adapters.football, { from: standardFrom, to: standardTo }),
          measureFetch('CS2', adapters.cs2, { from: standardFrom, to: standardTo }),
        ]);

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            allMatches = [...allMatches, ...result.value];
          }
        });
        console.log(`🏁 TỔNG THỜI GIAN HOÀN TẤT: ${Date.now() - startAll}ms\n`);
      } else {
        console.log(`\n--- BẮT ĐẦU ĐỒNG BỘ: ${activeSport.toUpperCase()} ---`);
        const adapter = adapters[activeSport];
        if (adapter) {
          const from = (activeSport === 'pubg' || activeSport === 'tft') ? extendedFrom : standardFrom;
          const to = (activeSport === 'pubg' || activeSport === 'tft') ? extendedTo : standardTo;
          allMatches = await measureFetch(activeSport.toUpperCase(), adapter, { from, to });
        }
      }

      return allMatches.sort((a, b) => {
        const priority = { live: 0, upcoming: 1, finished: 2 };
        const pA = priority[a.status] ?? 3;
        const pB = priority[b.status] ?? 3;
        
        if (pA !== pB) return pA - pB;
        if (a.status === 'finished') return new Date(b.start) - new Date(a.start);
        return new Date(a.start) - new Date(b.start);
      });
    }
  });

  const bgStyle = isDarkMode ? styles.containerDark : styles.containerLight;
  const headerText = isDarkMode ? '#FFF' : '#000';

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: headerText }]}>🏆 Esports</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={styles.iconButton}>
            {isDarkMode ? <Sun size={20} color="#FFF" /> : <Moon size={20} color="#000" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => refetch()} style={styles.iconButton}>
            <RefreshCw size={20} color={headerText} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {SPORTS_CONFIG.map(sport => {
            const isActive = activeSport === sport.id;
            return (
              <TouchableOpacity
                key={sport.id}
                onPress={() => setActiveSport(sport.id)}
                style={[
                  styles.filterButton,
                  isActive ? styles.filterButtonActive : (isDarkMode ? styles.filterButtonDark : styles.filterButtonLight)
                ]}
              >
                <Text style={[
                  styles.filterText,
                  isActive ? styles.filterTextActive : (isDarkMode ? styles.filterTextDark : styles.filterTextLight)
                ]}>
                  {sport.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={{flex: 1}}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Lỗi tải dữ liệu: {error.message}</Text>
        ) : matches.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Calendar size={48} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', marginTop: 16 }}>Không có trận đấu</Text>
          </View>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <MatchCard match={item} isDarkMode={isDarkMode} />
            )}
            contentContainerStyle={styles.listContainer}
            initialNumToRender={10}
            windowSize={5}
            maxToRenderPerBatch={10}
            removeClippedSubviews={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainContent />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  containerLight: {
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  filterButtonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  filterText: {
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextDark: {
    color: '#D1D5DB',
  },
  filterTextLight: {
    color: '#4B5563',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1F2937',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameName: {
    fontSize: 12,
    marginRight: 8,
  },
  leagueName: {
    flex: 1,
    fontSize: 12,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
  },
  cardBody: {
    marginTop: 4,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
  },
  logoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginRight: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  score: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  }
});
