// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   Image,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import * as Location from 'expo-location';
// // Audio import removed - voice feature coming soon
// import {COLORS, TYPOGRAPHY, SPACING} from '../../utils/constants';
// import {classifyIssue, analyzeIssueContent, processVoiceInput, getSmartSuggestions, AIClassificationResult, AIAnalysisResult} from '../../services/aiService';
// // import SyncService from '../../services/syncService';
// import {useSelector} from 'react-redux';
// import {RootState} from '../../store/store';

// interface IssueData {
//   title: string;
//   description: string;
//   category: string;
//   priority: string;
//   images: string[];
//   location: {
//     latitude: number;
//     longitude: number;
//     address: string;
//   } | null;
//   voiceNote?: string;
// }

// const CATEGORIES = [
//   {id: 'roads', name: '🛣️ Roads & Traffic', color: '#FF6B6B'},
//   {id: 'water', name: '💧 Water Supply', color: '#4ECDC4'},
//   {id: 'electricity', name: '⚡ Electricity', color: '#FFE66D'},
//   {id: 'waste', name: '🗑️ Waste Management', color: '#95E1D3'},
//   {id: 'public', name: '🏛️ Public Facilities', color: '#A8E6CF'},
//   {id: 'other', name: '📝 Other', color: '#C7CEEA'},
// ];

// const PRIORITIES = [
//   {id: 'low', name: 'Low', color: '#4CAF50'},
//   {id: 'medium', name: 'Medium', color: '#FF9800'},
//   {id: 'high', name: 'High', color: '#F44336'},
//   {id: 'critical', name: 'Critical', color: '#9C27B0'},
// ];

// const ReportIssueScreenAI: React.FC = () => {
//   const {user} = useSelector((state: RootState) => state.auth);
//   // const syncService = SyncService.getInstance();
//   const [issueData, setIssueData] = useState<IssueData>({
//     title: '',
//     description: '',
//     category: '',
//     priority: '',
//     images: [],
//     location: null,
//   });
  
//   const [aiClassification, setAiClassification] = useState<AIClassificationResult | null>(null);
//   const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
//   const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [aiProcessing, setAiProcessing] = useState(false);
//   // Voice feature coming soon - no state needed
//   const [showAiInsights, setShowAiInsights] = useState(false);

//   useEffect(() => {
//     getCurrentLocation();
//   }, []);

//   useEffect(() => {
//     if (issueData.title.length > 5 && issueData.description.length > 10) {
//       runAIAnalysis();
//     }
//   }, [issueData.title, issueData.description]);

//   const getCurrentLocation = async () => {
//     try {
//       const {status} = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission denied', 'Location permission is required');
//         return;
//       }

//       const location = await Location.getCurrentPositionAsync({});
//       const address = await Location.reverseGeocodeAsync({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//       });

//       setIssueData(prev => ({
//         ...prev,
//         location: {
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//           address: address[0] ? `${address[0].street}, ${address[0].city}` : 'Unknown location',
//         },
//       }));

//       // Get smart suggestions based on location
//       const suggestions = await getSmartSuggestions(location.coords.latitude, location.coords.longitude);
//       setSmartSuggestions(suggestions);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to get current location');
//     }
//   };

//   const runAIAnalysis = async () => {
//     if (aiProcessing) return;
    
//     setAiProcessing(true);
//     try {
//       // Run AI classification and analysis in parallel
//       const [classification, analysis] = await Promise.all([
//         classifyIssue(issueData.title, issueData.description),
//         analyzeIssueContent(issueData.title, issueData.description)
//       ]);

//       setAiClassification(classification);
//       setAiAnalysis(analysis);

//       // Auto-suggest category and priority if not set
//       if (!issueData.category && classification.confidence > 0.8) {
//         setIssueData(prev => ({...prev, category: classification.category}));
//       }
//       if (!issueData.priority && classification.confidence > 0.8) {
//         setIssueData(prev => ({...prev, priority: classification.priority}));
//       }
//     } catch (error) {
//       console.error('AI Analysis failed:', error);
//     }
//     setAiProcessing(false);
//   };



//   const takePhoto = async () => {
//     const {status} = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission denied', 'Camera permission is required to take photos');
//       return;
//     }

//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 0.8,
//     });

//     if (!result.canceled && result.assets[0]) {
//       setIssueData(prev => ({
//         ...prev,
//         images: [...prev.images, result.assets[0].uri],
//       }));
//     }
//   };

//   const removeImage = (index: number) => {
//     setIssueData(prev => ({
//       ...prev,
//       images: prev.images.filter((_, i) => i !== index),
//     }));
//   };

//   const handleVoiceInput = () => {
//     Alert.alert(
//       '🎤 Voice-to-Text Feature',
//       'This advanced voice recognition feature is coming soon!\n\n🚀 Features in development:\n• Real-time speech-to-text\n• Multi-language support\n• AI-powered transcription\n• Offline voice recognition\n\nFor now, please use the text input to describe your issue.',
//       [{ text: 'Got it!', style: 'default' }]
//     );
//   };

//   const applyAISuggestion = (field: 'category' | 'priority' | 'title') => {
//     if (!aiClassification) return;

//     setIssueData(prev => ({
//       ...prev,
//       [field]: field === 'title' ? aiClassification.suggestedTitle : aiClassification[field],
//     }));
//   };

//   const submitIssue = async () => {
//     if (!issueData.title.trim()) {
//       Alert.alert('Error', 'Please enter an issue title');
//       return;
//     }
//     if (!issueData.category) {
//       Alert.alert('Error', 'Please select a category');
//       return;
//     }
//     if (!issueData.location) {
//       Alert.alert('Error', 'Location is required');
//       return;
//     }

//     setLoading(true);
    
//     try {
//       // Submit report with sync to government dashboard
//       const reportId = await syncService.submitReport(
//         {
//           title: issueData.title,
//           description: issueData.description,
//           category: issueData.category,
//           priority: 'medium', // Default priority
//           location: issueData.location,
//           images: issueData.images,
//         },
//         user
//       );
      
//       setLoading(false);
//       Alert.alert(
//         '🎉 Success!',
//         `Your civic issue has been reported and forwarded to the relevant authorities.\n\n📋 Report ID: ${reportId}\n📍 Location: ${issueData.location?.address}\n🏷️ Category: ${issueData.category}\n\nGovernment officials will review and take appropriate action. You can track the progress in "My Reports" section.`,
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               // Reset form
//               setIssueData({
//                 title: '',
//                 description: '',
//                 category: '',
//                 priority: '',
//                 images: [],
//                 location: issueData.location,
//               });
//             },
//           },
//         ]
//       );
//     } catch (error) {
//       setLoading(false);
//       Alert.alert(
//         'Error',
//         'Failed to submit report. Please try again.',
//         [{text: 'OK'}]
//       );
//     }
//   };

//   const renderAIInsights = () => {
//     if (!aiClassification || !aiAnalysis) return null;

//     return (
//       <View style={styles.aiInsightsContainer}>
//         <View style={styles.aiHeader}>
//           <Text style={styles.aiTitle}>🤖 AI Insights</Text>
//           <Text style={styles.aiConfidence}>
//             {Math.round(aiClassification.confidence * 100)}% confident
//           </Text>
//         </View>

//         {/* AI Suggestions */}
//         <View style={styles.aiSuggestions}>
//           {issueData.title.length < 10 && (
//             <TouchableOpacity 
//               style={styles.aiSuggestion}
//               onPress={() => applyAISuggestion('title')}
//             >
//               <Text style={styles.aiSuggestionText}>
//                 💡 Suggested title: "{aiClassification.suggestedTitle}"
//               </Text>
//             </TouchableOpacity>
//           )}

//           {!issueData.category && (
//             <TouchableOpacity 
//               style={styles.aiSuggestion}
//               onPress={() => applyAISuggestion('category')}
//             >
//               <Text style={styles.aiSuggestionText}>
//                 🏷️ Suggested category: {aiClassification.category}
//               </Text>
//             </TouchableOpacity>
//           )}

//           {!issueData.priority && (
//             <TouchableOpacity 
//               style={styles.aiSuggestion}
//               onPress={() => applyAISuggestion('priority')}
//             >
//               <Text style={styles.aiSuggestionText}>
//                 ⚡ Suggested priority: {aiClassification.priority}
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* AI Analysis */}
//         <View style={styles.aiAnalysisGrid}>
//           <View style={styles.aiAnalysisItem}>
//             <Text style={styles.aiAnalysisLabel}>Urgency</Text>
//             <Text style={styles.aiAnalysisValue}>{aiAnalysis.urgency}/10</Text>
//           </View>
//           <View style={styles.aiAnalysisItem}>
//             <Text style={styles.aiAnalysisLabel}>Sentiment</Text>
//             <Text style={styles.aiAnalysisValue}>
//               {aiAnalysis.sentiment === 'positive' ? '😊' : 
//                aiAnalysis.sentiment === 'negative' ? '😠' : '😐'}
//             </Text>
//           </View>
//           <View style={styles.aiAnalysisItem}>
//             <Text style={styles.aiAnalysisLabel}>Similar Issues</Text>
//             <Text style={styles.aiAnalysisValue}>{aiClassification.similarIssues}</Text>
//           </View>
//           <View style={styles.aiAnalysisItem}>
//             <Text style={styles.aiAnalysisLabel}>Est. Resolution</Text>
//             <Text style={styles.aiAnalysisValue}>{aiClassification.estimatedResolutionTime}</Text>
//           </View>
//         </View>

//         {/* Tags */}
//         {aiClassification.tags.length > 0 && (
//           <View style={styles.aiTags}>
//             <Text style={styles.aiTagsLabel}>Tags:</Text>
//             <View style={styles.aiTagsContainer}>
//               {aiClassification.tags.map((tag, index) => (
//                 <View key={index} style={styles.aiTag}>
//                   <Text style={styles.aiTagText}>{tag}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>
//         )}
//       </View>
//     );
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       <View style={styles.header}>
//         <Text style={styles.title}>📋 Report Civic Issue</Text>
//         <Text style={styles.subtitle}>Help improve your community</Text>
//       </View>





//       {/* Title Section with Voice Input */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>📋 Issue Title</Text>
//         <Text style={styles.voiceHint}>
//           🎤 Voice-to-text feature coming soon! Tap to learn more
//         </Text>
//         <View style={styles.titleInputContainer}>
//           <TextInput
//             style={styles.titleInput}
//             placeholder="Brief description of the issue"
//             value={issueData.title}
//             onChangeText={text => setIssueData(prev => ({...prev, title: text}))}
//             maxLength={100}
//             multiline
//           />
//           <TouchableOpacity 
//             style={styles.voiceTitleButton}
//             onPress={handleVoiceInput}
//           >
//             <Text style={styles.voiceTitleIcon}>🎤</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Description Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>📝 Description</Text>
//         <TextInput
//           style={styles.textArea}
//           placeholder="Provide detailed description..."
//           value={issueData.description}
//           onChangeText={text => setIssueData(prev => ({...prev, description: text}))}
//           multiline
//           numberOfLines={4}
//           maxLength={500}
//         />
//       </View>

//       {/* Camera Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>📸 Capture Evidence</Text>
//         <Text style={styles.cameraInstructions}>Take photos of the issue to help authorities understand and resolve it faster</Text>
//         <TouchableOpacity style={styles.professionalCameraButton} onPress={takePhoto}>
//           <Text style={styles.cameraIcon}>📷</Text>
//           <Text style={styles.professionalCameraText}>Take Photo of Issue</Text>
//           <Text style={styles.cameraSubtext}>Capture current condition</Text>
//         </TouchableOpacity>
        
//         {/* Display captured evidence */}
//         {issueData.images.length > 0 && (
//           <View style={styles.evidenceContainer}>
//             <Text style={styles.evidenceLabel}>📸 Evidence Captured ({issueData.images.length}):</Text>
//             <Text style={styles.evidenceSubtext}>Photos will help authorities assess and resolve the issue</Text>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               {issueData.images.map((imageUri, index) => (
//                 <View key={index} style={styles.evidenceWrapper}>
//                   <Image source={{uri: imageUri}} style={styles.evidenceImage} />
//                   <TouchableOpacity
//                     style={styles.removeEvidenceButton}
//                     onPress={() => removeImage(index)}
//                   >
//                     <Text style={styles.removeEvidenceText}>✕</Text>
//                   </TouchableOpacity>
//                   <Text style={styles.evidenceIndex}>Photo {index + 1}</Text>
//                 </View>
//               ))}
//             </ScrollView>
//           </View>
//         )}
//       </View>

//       {/* Category Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>🏷️ Category</Text>
//         <View style={styles.optionsGrid}>
//           {CATEGORIES.map(category => (
//             <TouchableOpacity
//               key={category.id}
//               style={[
//                 styles.optionCard,
//                 {borderColor: category.color},
//                 issueData.category === category.id && {backgroundColor: category.color + '20'},
//               ]}
//               onPress={() => setIssueData(prev => ({...prev, category: category.id}))}
//             >
//               <Text style={styles.optionText}>{category.name}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>





//       {/* Submit Button */}
//       <TouchableOpacity
//         style={[styles.submitButton, loading && styles.submitButtonDisabled]}
//         onPress={submitIssue}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color={COLORS.white} />
//         ) : (
//           <Text style={styles.submitButtonText}>🚀 Submit Report</Text>
//         )}
//       </TouchableOpacity>

//       <View style={styles.bottomPadding} />
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   header: {
//     padding: SPACING.lg,
//     backgroundColor: COLORS.primary,
//     alignItems: 'center',
//   },
//   title: {
//     ...TYPOGRAPHY.h1,
//     color: COLORS.white,
//     marginBottom: SPACING.xs,
//   },
//   subtitle: {
//     ...TYPOGRAPHY.body,
//     color: COLORS.white,
//     opacity: 0.9,
//   },
//   aiProcessingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: SPACING.md,
//     backgroundColor: COLORS.primary + '10',
//     margin: SPACING.md,
//     borderRadius: 8,
//   },
//   aiProcessingText: {
//     ...TYPOGRAPHY.body,
//     color: COLORS.primary,
//     marginLeft: SPACING.sm,
//   },
//   aiInsightsContainer: {
//     margin: SPACING.md,
//     padding: SPACING.md,
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: COLORS.primary + '30',
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   aiHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: SPACING.md,
//   },
//   aiTitle: {
//     ...TYPOGRAPHY.h3,
//     color: COLORS.primary,
//   },
//   aiConfidence: {
//     ...TYPOGRAPHY.caption,
//     color: COLORS.success,
//     fontWeight: 'bold',
//   },
//   aiSuggestions: {
//     marginBottom: SPACING.md,
//   },
//   aiSuggestion: {
//     backgroundColor: COLORS.primary + '10',
//     padding: SPACING.sm,
//     borderRadius: 8,
//     marginBottom: SPACING.sm,
//   },
//   aiSuggestionText: {
//     ...TYPOGRAPHY.body,
//     color: COLORS.primary,
//   },
//   aiAnalysisGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginBottom: SPACING.md,
//   },
//   aiAnalysisItem: {
//     width: '48%',
//     alignItems: 'center',
//     padding: SPACING.sm,
//     backgroundColor: COLORS.background,
//     borderRadius: 8,
//     marginBottom: SPACING.sm,
//   },
//   aiAnalysisLabel: {
//     ...TYPOGRAPHY.caption,
//     color: COLORS.textSecondary,
//     marginBottom: SPACING.xs,
//   },
//   aiAnalysisValue: {
//     ...TYPOGRAPHY.body,
//     color: COLORS.text,
//     fontWeight: 'bold',
//   },
//   aiTags: {
//     marginTop: SPACING.sm,
//   },
//   aiTagsLabel: {
//     ...TYPOGRAPHY.body,
//     color: COLORS.text,
//     marginBottom: SPACING.sm,
//   },
//   aiTagsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: SPACING.sm,
//   },
//   aiTag: {
//     backgroundColor: COLORS.secondary,
//     paddingHorizontal: SPACING.sm,
//     paddingVertical: SPACING.xs,
//     borderRadius: 12,
//   },
//   aiTagText: {
//     ...TYPOGRAPHY.caption,
//     color: COLORS.white,
//   },
//   section: {
//     margin: SPACING.md,
//     padding: SPACING.md,
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sectionTitle: {
//     ...TYPOGRAPHY.h3,
//     color: COLORS.text,
//     marginBottom: SPACING.md,
//   },
//   voiceHint: {
//     ...TYPOGRAPHY.caption,
//     color: COLORS.textSecondary,
//     marginBottom: SPACING.sm,
//     fontStyle: 'italic',
//     textAlign: 'center',
//     fontWeight: '500',
//   },
//   voiceHintListening: {
//     color: COLORS.error,
//     fontWeight: '700',
//     fontSize: 14,
//   },
//   voiceHintProcessing: {
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   titleInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: 12,
//     backgroundColor: COLORS.white,
//   },
//   titleInputListening: {
//     borderColor: COLORS.primary,
//     borderWidth: 2,
//     backgroundColor: COLORS.primary + '05',
//   },
//   titleInput: {
//     flex: 1,
//     padding: SPACING.md,
//     fontSize: 16,
//     minHeight: 50,
//     textAlignVertical: 'top',
//   },
//   voiceTitleButton: {
//     backgroundColor: COLORS.primary,
//     padding: SPACING.sm,
//     borderRadius: 8,
//     margin: SPACING.xs,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 40,
//     height: 40,
//   },
//   voiceTitleButtonListening: {
//     backgroundColor: COLORS.error,
//     transform: [{scale: 1.1}],
//   },
//   voiceTitleButtonProcessing: {
//     backgroundColor: COLORS.secondary,
//   },
//   voiceTitleIcon: {
//     fontSize: 18,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: 8,
//     padding: SPACING.md,
//     fontSize: 16,
//   },
//   textArea: {
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: 8,
//     padding: SPACING.md,
//     fontSize: 16,
//     minHeight: 100,
//     textAlignVertical: 'top',
//   },
//   optionsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: SPACING.sm,
//   },
//   optionCard: {
//     flex: 1,
//     minWidth: '45%',
//     padding: SPACING.md,
//     borderWidth: 2,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   optionText: {
//     ...TYPOGRAPHY.body,
//     textAlign: 'center',
//   },
//   aiSuggestedOption: {
//     borderStyle: 'dashed',
//     backgroundColor: COLORS.primary + '05',
//   },
//   aiSuggestedLabel: {
//     ...TYPOGRAPHY.caption,
//     color: COLORS.primary,
//     fontWeight: 'bold',
//     marginTop: SPACING.xs,
//   },
//   priorityRow: {
//     flexDirection: 'row',
//     gap: SPACING.sm,
//   },
//   priorityCard: {
//     flex: 1,
//     padding: SPACING.md,
//     borderWidth: 2,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   priorityText: {
//     ...TYPOGRAPHY.body,
//     fontWeight: '600',
//   },
//   suggestionItem: {
//     paddingVertical: SPACING.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   suggestionText: {
//     ...TYPOGRAPHY.body,
//     color: COLORS.textSecondary,
//   },
//   submitButton: {
//     backgroundColor: COLORS.primary,
//     margin: SPACING.lg,
//     padding: SPACING.lg,
//     borderRadius: 12,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 4},
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   submitButtonDisabled: {
//     opacity: 0.6,
//   },
//   submitButtonText: {
//     ...TYPOGRAPHY.h3,
//     color: COLORS.white,
//   },
//   cameraInstructions: {
//     ...TYPOGRAPHY.body,
//     color: COLORS.textSecondary,
//     marginBottom: SPACING.lg,
//     lineHeight: 22,
//     textAlign: 'center',
//   },
//   professionalCameraButton: {
//     backgroundColor: COLORS.primary,
//     padding: SPACING.lg,
//     borderRadius: 16,
//     alignItems: 'center',
//     marginBottom: SPACING.md,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 4},
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   professionalCameraText: {
//     ...TYPOGRAPHY.h4,
//     color: COLORS.white,
//     marginTop: SPACING.sm,
//     fontWeight: '600',
//   },
//   cameraSubtext: {
//     ...TYPOGRAPHY.caption,
//     color: COLORS.white,
//     opacity: 0.9,
//     marginTop: SPACING.xs,
//   },
//   cameraIcon: {
//     fontSize: 20,
//     marginRight: SPACING.sm,
//   },
//   cameraButtonText: {
//     ...TYPOGRAPHY.body,
//     color: COLORS.white,
//     fontWeight: '600',
//   },
//   evidenceContainer: {
//     marginTop: SPACING.lg,
//     padding: SPACING.md,
//     backgroundColor: COLORS.primary + '10',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: COLORS.primary + '30',
//   },
//   evidenceLabel: {
//     ...TYPOGRAPHY.body,
//     color: COLORS.primary,
//     marginBottom: SPACING.xs,
//     fontWeight: '700',
//   },
//   evidenceSubtext: {
//     ...TYPOGRAPHY.caption,
//     color: COLORS.textSecondary,
//     marginBottom: SPACING.md,
//     fontStyle: 'italic',
//   },
//   evidenceWrapper: {
//     position: 'relative',
//     marginRight: SPACING.md,
//     alignItems: 'center',
//   },
//   evidenceImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: COLORS.primary + '50',
//   },
//   removeEvidenceButton: {
//     position: 'absolute',
//     top: -8,
//     right: -8,
//     backgroundColor: COLORS.error,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   removeEvidenceText: {
//     color: COLORS.white,
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   evidenceIndex: {
//     ...TYPOGRAPHY.caption,
//     color: COLORS.primary,
//     marginTop: SPACING.xs,
//     fontWeight: '600',
//   },
//   bottomPadding: {
//     height: 50,
//   },
// });

// export default ReportIssueScreenAI;