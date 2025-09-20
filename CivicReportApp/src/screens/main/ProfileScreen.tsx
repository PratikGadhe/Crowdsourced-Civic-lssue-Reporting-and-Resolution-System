import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../../store/store';
import {logout} from '../../store/slices/authSlice';
import {COLORS, TYPOGRAPHY, SPACING} from '../../utils/constants';

interface UserStats {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  communityRank: number;
  badgesEarned: string[];
  joinedDate: string;
  impactScore: number;
}

const MOCK_USER_STATS: UserStats = {
  totalReports: 23,
  resolvedReports: 18,
  pendingReports: 5,
  communityRank: 47,
  badgesEarned: ['🏆 Top Reporter', '⚡ Quick Responder', '📸 Photo Pro', '🎯 Accurate Reporter'],
  joinedDate: '2024-01-01',
  impactScore: 847,
};

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.auth);
  const [userStats] = useState<UserStats>(MOCK_USER_STATS);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || 'Pratik Gadhe',
    email: user?.email || 'pratikgadhe366@gmail.com',
    phone: user?.phone || '+91 9876543210',
  });
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailUpdates: true,
    smsAlerts: false,
    communityUpdates: true,
  });
  const [showSettings, setShowSettings] = useState(false);

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

  const handleSaveProfile = () => {
    // Simple profile update - just show success and close modal
    Alert.alert('Success', 'Profile updated successfully!');
    setEditMode(false);
    
    // In a real app, you would dispatch to Redux store:
    // dispatch(updateUser(editedProfile));
  };

  const getProgressPercentage = () => {
    return userStats.totalReports > 0 ? (userStats.resolvedReports / userStats.totalReports) * 100 : 0;
  };

  const renderUserHeader = () => (
    <View style={styles.userHeader}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{(editedProfile.name || 'Pratik Gadhe').charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{editedProfile.name || 'Pratik Gadhe'}</Text>
        <Text style={styles.userEmail}>{editedProfile.email || 'pratikgadhe366@gmail.com'}</Text>
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>🏆 Community Rank #{userStats.communityRank}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => setEditMode(true)}
      >
        <Text style={styles.editButtonText}>✏️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>📊 Your Impact</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.totalReports}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, {color: COLORS.success}]}>{userStats.resolvedReports}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, {color: COLORS.warning}]}>{userStats.pendingReports}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, {color: COLORS.primary}]}>{userStats.impactScore}</Text>
          <Text style={styles.statLabel}>Impact Score</Text>
        </View>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Resolution Rate</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${getProgressPercentage()}%`}]} />
        </View>
        <Text style={styles.progressText}>{Math.round(getProgressPercentage())}% of your reports resolved</Text>
      </View>
    </View>
  );

  const renderBadges = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏅 Achievements</Text>
      <View style={styles.badgesContainer}>
        {userStats.badgesEarned.map((badge, index) => (
          <View key={index} style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>View Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Export Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>🎯</Text>
          <Text style={styles.actionText}>Set Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionText}>Invite Friends</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.settingsHeader}
        onPress={() => setShowSettings(!showSettings)}
      >
        <Text style={styles.sectionTitle}>⚙️ Settings</Text>
        <Text style={styles.settingsToggle}>{showSettings ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      
      {showSettings && (
        <View style={styles.settingsContent}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notifications.pushNotifications}
              onValueChange={(value) => setNotifications(prev => ({...prev, pushNotifications: value}))}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Email Updates</Text>
            <Switch
              value={notifications.emailUpdates}
              onValueChange={(value) => setNotifications(prev => ({...prev, emailUpdates: value}))}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>SMS Alerts</Text>
            <Switch
              value={notifications.smsAlerts}
              onValueChange={(value) => setNotifications(prev => ({...prev, smsAlerts: value}))}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Community Updates</Text>
            <Switch
              value={notifications.communityUpdates}
              onValueChange={(value) => setNotifications(prev => ({...prev, communityUpdates: value}))}
            />
          </View>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account & settings</Text>
      </View>

      {/* User Header */}
      {renderUserHeader()}

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Badges */}
      {renderBadges()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Settings */}
      {renderSettings()}

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Account</Text>
        <TouchableOpacity style={styles.accountAction}>
          <Text style={styles.accountActionText}>📱 Change Password</Text>
          <Text style={styles.accountActionArrow}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accountAction}>
          <Text style={styles.accountActionText}>🔒 Privacy Settings</Text>
          <Text style={styles.accountActionArrow}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accountAction}>
          <Text style={styles.accountActionText}>❓ Help & Support</Text>
          <Text style={styles.accountActionArrow}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accountAction}>
          <Text style={styles.accountActionText}>📋 Terms & Privacy</Text>
          <Text style={styles.accountActionArrow}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>🚪 Logout</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Member since {userStats.joinedDate}</Text>
        <Text style={styles.versionText}>Resolve360 v2.0</Text>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={editMode}
        animationType="slide"
        transparent
        onRequestClose={() => setEditMode(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ Edit Profile</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEditMode(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editedProfile.name}
                  onChangeText={(text) => setEditedProfile(prev => ({...prev, name: text}))}
                  placeholder="Enter your name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editedProfile.email}
                  onChangeText={(text) => setEditedProfile(prev => ({...prev, email: text}))}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editedProfile.phone}
                  onChangeText={(text) => setEditedProfile(prev => ({...prev, phone: text}))}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditMode(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    marginTop: -SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  userBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  userBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 18,
  },
  section: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsSection: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
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
  progressSection: {
    marginTop: SPACING.md,
  },
  progressLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  badge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  actionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    textAlign: 'center',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsToggle: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
  },
  settingsContent: {
    marginTop: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  accountAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  accountActionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  accountActionArrow: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
  },
  footer: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  versionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  saveButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default ProfileScreen;