import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AppButton, ScreenHeader, menuStyles } from '../components';
import { colors, spacing, typography, radii, shadow } from '../theme/theme';

const PARTNERS = [
  { source: require('../../assets/pchrd.png'), label: 'DOST-PCHRD' },
  { source: require('../../assets/UPMIN.png'), label: 'UP Mindanao' },
  { source: require('../../assets/cvo.png'), label: "City Veterinarian's Office" },
  { source: require('../../assets/stoprabies.png'), label: 'STOP Rabies' },
  { source: require('../../assets/pgc.png'), label: 'Philippine Genome Center' },
  { source: require('../../assets/pawsitivity1.png'), label: 'The PAWSitivity Project' },
];

const AboutUs = () => {
  const navigation = useNavigation();
  const { state } = useAuth();

  const handleMainMenuNavigation = () => {
    switch (state.user.position) {
      case 'CVO':
      case 'RabDash':
        navigation.navigate('VetMenu');
        break;
      default:
        navigation.navigate('MainMenu');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Welcome to RabDash" subtitle="A rabies forecasting dashboard" />

        <Text style={styles.subheader}>About the Project</Text>
        <Text style={styles.content}>
          Leveraging data and research to assist in achieving a rabies-free Davao
          City by 2030, the RabDash DC project aims to establish a rabies data
          analytics dashboard and integrate predictive models and genome
          informatics to support and optimize local rabies control programs. The
          project, which began on September 1, 2022, is funded by the Department
          of Science and Technology - Philippine Council for Health Research and
          Development and implemented by the University of the Philippines
          Mindanao.
        </Text>
        <Text style={styles.content}>
          The RabDash DC project, in collaboration with the City Veterinarian's
          Office and the Philippine Genome Center Mindanao, is made possible
          following the milestones of its predecessors: STOP Rabies (2018-2020)
          and RabCast (2021-2022). The project's research endeavors are an
          interdisciplinary collaboration among experts from the fields of
          biomathematics, economics, human health science, and veterinary
          medicine.
        </Text>

        <Text style={styles.subheader}>Our Partners</Text>
        <View style={styles.partnerGrid}>
          {PARTNERS.map((partner) => (
            <View key={partner.label} style={styles.partnerCard}>
              <Image source={partner.source} style={styles.partnerLogo} resizeMode="contain" />
              <Text style={styles.partnerLabel}>{partner.label}</Text>
            </View>
          ))}
        </View>

        <AppButton
          title="Main Menu"
          variant="ghost"
          onPress={handleMainMenuNavigation}
          style={[menuStyles.backButton, styles.mainMenuButton]}
          textStyle={menuStyles.backButtonText}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    paddingTop: spacing.xxxl * 1.75,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  subheader: {
    ...typography.title,
    color: colors.onPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  content: {
    ...typography.body,
    color: colors.onPrimary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  partnerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  partnerCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow,
  },
  partnerLogo: {
    width: 72,
    height: 72,
    marginBottom: spacing.sm,
  },
  partnerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mainMenuButton: {
    marginTop: spacing.lg,
  },
});

export default AboutUs;
