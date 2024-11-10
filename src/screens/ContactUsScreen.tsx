import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ContactUsScreen = () => {
  const email = 'dubaidebremewi2021@gmail.com';
  const whatsappNumber = '+971525591976';
  const socialMedia = {
    facebook: 'https://www.facebook.com/p/የዱባይ-ደብረ-መዊዕጥ-ቅዱስ-ሚካኤል-ወቅድስት-አርሴማ-ቤተክርስቲያን-100066376306439/',
    youtube: 'https://www.youtube.com/@-dubaidebremewi',
    tiktok: 'https://www.tiktok.com/@dubaidebremewi'
  };

  const handleEmailPress = async () => {
    try {
      await Linking.openURL(`mailto:${email}`);
    } catch (error) {
      console.error('Error opening email:', error);
    }
  };

  const handleWhatsAppPress = async () => {
    try {
      await Linking.openURL(`whatsapp://send?phone=${whatsappNumber}`);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // Fallback to web WhatsApp if the app is not installed
      await Linking.openURL(`https://wa.me/${whatsappNumber}`);
    }
  };

  const handleSocialMediaPress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening social media link:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Contact Us</Text>
        
        <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={24} color="#fff" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>{email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handleWhatsAppPress}>
          <View style={[styles.iconContainer, { backgroundColor: '#25D366' }]}>
            <Ionicons name="logo-whatsapp" size={24} color="#fff" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactLabel}>WhatsApp</Text>
            <Text style={styles.contactValue}>{whatsappNumber}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Social Media</Text>

        <TouchableOpacity 
          style={styles.contactItem} 
          onPress={() => handleSocialMediaPress(socialMedia.facebook)}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#1877F2' }]}>
            <Ionicons name="logo-facebook" size={24} color="#fff" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactLabel}>Facebook</Text>
            <Text style={styles.contactValue}>Follow us on Facebook</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.contactItem} 
          onPress={() => handleSocialMediaPress(socialMedia.youtube)}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FF0000' }]}>
            <Ionicons name="logo-youtube" size={24} color="#fff" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactLabel}>YouTube</Text>
            <Text style={styles.contactValue}>Subscribe to our channel</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.contactItem} 
          onPress={() => handleSocialMediaPress(socialMedia.tiktok)}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#000000' }]}>
            <Ionicons name="logo-tiktok" size={24} color="#fff" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactLabel}>TikTok</Text>
            <Text style={styles.contactValue}>Follow us on TikTok</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 32, // Add extra padding at the bottom
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
  },
});

export default ContactUsScreen; 