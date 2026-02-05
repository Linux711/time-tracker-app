import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import colors from '../constants/colors';

interface AddActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, color: string, weeklyGoal?: number) => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [weeklyGoal, setWeeklyGoal] = useState('');

  const handleSave = async () => {
    if (name.trim() && selectedColor) {
      try {
        const goal = weeklyGoal ? parseFloat(weeklyGoal) : undefined;
        await onAdd(name.trim(), selectedColor, goal);
        handleClose(); // Reset state and close modal after successful save
      } catch (error) {
        // Error is handled by the parent component
        console.error('Error saving activity:', error);
      }
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedColor('');
    setWeeklyGoal('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Activity</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Activity Name Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter activity name"
              placeholderTextColor={colors.colors.textLight}
            />
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose a Color</Text>
            <View style={styles.colorRow}>
              {colors.activityColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorButtonSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <View style={styles.colorCheckmark} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weekly Goal Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Goal (hours)</Text>
            <TextInput
              style={styles.textInput}
              value={weeklyGoal}
              onChangeText={setWeeklyGoal}
              placeholder="Optional"
              placeholderTextColor={colors.colors.textLight}
              keyboardType="numeric"
            />
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !(name.trim() && selectedColor) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!(name.trim() && selectedColor)}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.colors.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.colors.text,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.colors.text,
    backgroundColor: colors.colors.cardBackground,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: colors.colors.text,
  },
  colorCheckmark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.colors.text,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.colors.border,
    backgroundColor: colors.colors.cardBackground,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.colors.text,
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: colors.colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: colors.colors.textLight,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.colors.textDark,
    textAlign: 'center',
  },
});

export default AddActivityModal;
