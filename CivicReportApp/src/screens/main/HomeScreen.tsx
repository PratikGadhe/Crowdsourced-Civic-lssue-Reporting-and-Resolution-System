import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {MainTabScreenProps} from '../../types/navigation';
import {RootState, AppDispatch} from '../../store/store';
import {logout} from '../../store/slices/authSlice';
import {COLORS, TYPOGRAPHY, SPACING} from '../../utils/constants';

type Props = MainTabScreenProps<'Home'>;

interface CommunityStats {
  totalReports: number;
  resolvedToday: number;
  activeUsers: number;
  responseTime: string;
}

interface RecentActivity {
  id: string;
  type: 'report' | 'resolved' | 'comment';
  title: string;
  time: string;
  category: string;
  priority?: string;
}

interface TrendingIssue {
  id: string;
  title: string;
  category: string;
  reports: number;
  trend: 'up' | 'down' | 'stable';
}

const MOCK_STATS: CommunityStats = {
  totalReports: 1247,
  resolvedToday: 23,
  activeUsers: 892,
  responseTime: '2.3 hours',
};

const MOCK_RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: '1',
    type: 'resolved',
    title: 'Street light fixed on Main St',
    time: '2 hours ago',
    category: 'electricity',
  },
  {
    id: '2',
    type: 'report',
    title: 'New pothole reported on Oak Ave',
    time: '4 hours ago',
    category: 'roads',
    priority: 'high',
  },
  {
    id: '3',
    type: 'resolved',
    title: 'Garbage collection completed',
    time: '6 hours ago',
    category: 'waste',
  },
  {
    id: '4',
    type: 'comment',
    title: 'Update on water pipe repair',
    time: '8 hours ago',
    category: 'water',
  },
];

const MOCK_TRENDING: TrendingIssue[] = [
  {
    id: '1',
    title: 'Road Maintenance',
    category: 'roads',
    reports: 45,
    trend: 'up',
  },
  {
    id: '2',
    title: 'Street Lighting',
    category: 'electricity',
    reports: 32,
    trend: 'down',
  },
  {
    id: '3',
    title: 'Water Supply',
    category: 'water',
    reports: 28,
    trend: 'up',
  },
];

const CATEGORY_INFO = {
  roads: {icon: '🛣️', name: 'Roads', color: '#FF6B6B'},
  water: {icon: '💧', name: 'Water', color: '#4ECDC4'},
  electricity: {icon: '⚡', name: 'Electricity', color: '#FFE66D'},
  waste: {icon: '🗑️', name: 'Waste', color: '#95E1D3'},
  public: {icon: '🏛️', name: 'Public', color: '#A8E6CF'},
};

const {width} = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<CommunityStats>(MOCK_STATS);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(MOCK_RECENT_ACTIVITY);
  const [trending, setTrending] = useState<TrendingIssue[]>(MOCK_TRENDING);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      // Update stats with slight variations
      setStats(prev => ({
        ...prev,
        resolvedToday: prev.resolvedToday + Math.floor(Math.random() * 3),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
      }));
    }, 1500);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Logout', style: 'destructive', onPress: () => dispatch(logout())},
      ]
    );
  };

  const navigateToScreen = (screen: keyof any) => {
    navigation.navigate(screen);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resolved': return '✅';
      case 'report': return '📝';
      case 'comment': return '💬';
      default: return '📋';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}!</Text>
            <Text style={styles.userName}>Pratik Gadhe</Text>
            <Text style={styles.subtitle}>Resolve360 - Making cities better together</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>



      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, {backgroundColor: '#FF6B6B20'}]}
            onPress={() => navigateToScreen('ReportIssue')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionTitle}>Report Issue</Text>
            <Text style={styles.actionSubtitle}>Report a new civic problem</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, {backgroundColor: '#4ECDC420'}]}
            onPress={() => navigateToScreen('Map')}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionTitle}>View Map</Text>
            <Text style={styles.actionSubtitle}>See issues in your area</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, {backgroundColor: '#FFE66D20'}]}
            onPress={() => navigateToScreen('MyReports')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionTitle}>My Reports</Text>
            <Text style={styles.actionSubtitle}>Track your submissions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, {backgroundColor: '#95E1D320'}]}
            onPress={() => Alert.alert('Coming Soon', 'Community features will be available soon!')}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionTitle}>Community</Text>
            <Text style={styles.actionSubtitle}>Connect with neighbors</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📰 Recent Activity</Text>
        <View style={styles.activityContainer}>
          {recentActivity.map(activity => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>{getActivityIcon(activity.type)}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityCategory}>
                    {CATEGORY_INFO[activity.category as keyof typeof CATEGORY_INFO]?.icon} {CATEGORY_INFO[activity.category as keyof typeof CATEGORY_INFO]?.name}
                  </Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Trending Issues */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Trending Issues</Text>
        <View style={styles.trendingContainer}>
          {trending.map((issue, index) => (
            <View key={issue.id} style={styles.trendingItem}>
              <View style={styles.trendingRank}>
                <Text style={styles.trendingRankText}>{index + 1}</Text>
              </View>
              <View style={styles.trendingContent}>
                <Text style={styles.trendingTitle}>{issue.title}</Text>
                <Text style={styles.trendingCategory}>
                  {CATEGORY_INFO[issue.category as keyof typeof CATEGORY_INFO]?.icon} {issue.reports} reports
                </Text>
              </View>
              <View style={styles.trendingTrend}>
                <Text style={styles.trendingTrendIcon}>{getTrendIcon(issue.trend)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Emergency Contact */}
      <View style={styles.section}>
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>Emergency?</Text>
            <Text style={styles.emergencySubtitle}>For urgent issues, call emergency services</Text>
          </View>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => Alert.alert('Emergency', 'This would dial emergency services in a real app')}
          >
            <Text style={styles.emergencyButtonText}>Call 911</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🏛️ Resolve360 - Making cities better, one report at a time
        </Text>
        <Text style={styles.versionText}>Version 2.0 - Team Resolve360</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  greeting: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  userName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    marginVertical: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    opacity: 0.8,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    marginTop: -SPACING.lg,
    marginHorizontal: SPACING.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statNumber: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  actionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
  },
  activityTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  trendingContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  trendingRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  trendingRankText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  trendingContent: {
    flex: 1,
  },
  trendingTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  trendingCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  trendingTrend: {
    marginLeft: SPACING.md,
  },
  trendingTrendIcon: {
    fontSize: 20,
  },
  emergencyCard: {
    backgroundColor: '#FF6B6B20',
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B40',
  },
  emergencyIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  emergencySubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  emergencyButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  emergencyButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  footer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  versionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default HomeScreen;