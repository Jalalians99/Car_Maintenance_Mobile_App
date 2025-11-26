import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export class ImageUploadService {
  /**
   * Request camera permissions
   */
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to take photos. Please enable it in your device settings.'
        );
        return false;
      }
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to request camera permission');
      return false;
    }
  }

  /**
   * Request gallery/media library permissions
   */
  static async requestGalleryPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Gallery permission is required to select photos. Please enable it in your device settings.'
        );
        return false;
      }
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to request gallery permission');
      return false;
    }
  }

  /**
   * Take a photo with camera
   */
  static async takePhoto(): Promise<string | null> {
    try {
      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images' as ImagePicker.MediaType,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  /**
   * Pick an image from gallery
   */
  static async pickImage(): Promise<string | null> {
    try {
      const hasPermission = await this.requestGalleryPermission();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as ImagePicker.MediaType,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
      return null;
    }
  }

  /**
   * Upload image to Firebase Storage
   */
  static async uploadCarImage(carId: string, imageUri: string): Promise<string> {
    try {
      // Fetch the image
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create unique filename
      const filename = `car_${carId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `cars/${carId}/${filename}`);

      // Upload the image
      await uploadBytes(storageRef, blob);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error: any) {
      throw new Error('Failed to upload image: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Delete image from Firebase Storage
   */
  static async deleteCarImage(imageUrl: string): Promise<void> {
    try {
      // Extract the path from the URL
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error: any) {
      throw new Error('Failed to delete image: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Show image source selection dialog
   */
  static async showImageSourceDialog(
    onCamera: () => void,
    onGallery: () => void
  ): Promise<void> {
    Alert.alert(
      'Add Car Photo',
      'Choose a photo source',
      [
        {
          text: 'Take Photo',
          onPress: onCamera,
        },
        {
          text: 'Choose from Gallery',
          onPress: onGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }
}

