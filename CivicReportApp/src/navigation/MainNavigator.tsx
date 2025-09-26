import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import type { MainTabParamList } from '../types/navigation';
import { COLORS } from '../utils/constants';
import { RootState } from '../store/store';

// Import screens
import HomeScreen from '../screens/main/HomeScreen';
import ReportIssueScreen from '../screens/main/ReportIssueScreen';
import MyReportsScreen from '../screens/main/MyReportsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EngineerTasksScreen from '../screens/main/EngineerTasksScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isEngineer = user?.userType === 'engineer';
  return (
    <Tab.Navigator
      initialRouteName={isEngineer ? "EngineerTasks" : "Home"}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      {isEngineer ? (
        // Engineer tabs
        <>
          <Tab.Screen
            name="EngineerTasks"
            component={EngineerTasksScreen}
            options={{
              tabBarLabel: 'My Tasks',
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profile',
            }}
          />
        </>
      ) : (
        // Citizen tabs
        <>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Home',
            }}
          />
          <Tab.Screen
            name="ReportIssue"
            component={ReportIssueScreen}
            options={{
              tabBarLabel: 'Report',
            }}
          />
          <Tab.Screen
            name="MyReports"
            component={MyReportsScreen}
            options={{
              tabBarLabel: 'My Reports',
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profile',
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};

export default MainNavigator;