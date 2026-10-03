import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { addDays, dateKey, formatChip, relativeLabel, today } from '../dates';
import { colors, font, radius } from '../theme';

const DAYS_SHOWN = 14;

type Props = {
  earliest: Date;
  selected: Date;
  onSelect: (date: Date) => void;
};

export default function DatePicker({ earliest, selected, onSelect }: Props) {
  const start = today();
  const earliestKey = dateKey(earliest);
  const selectedKey = dateKey(selected);

  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => addDays(start, i));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {days.map((date) => {
        const key = dateKey(date);
        const disabled = key < earliestKey;
        const active = key === selectedKey;
        const chip = formatChip(date);
        const rel = relativeLabel(date);

        return (
          <Pressable
            key={key}
            disabled={disabled}
            onPress={() => onSelect(date)}
            accessibilityLabel={`${chip.day} ${chip.num} ${chip.month}${disabled ? ' (belum bisa)' : ''}`}
            style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
          >
            <Text style={[styles.day, active && styles.textActive]}>{rel ?? chip.day}</Text>
            <Text style={[styles.num, active && styles.textActive]}>{chip.num}</Text>
            <Text style={[styles.month, active && styles.textActive]}>{chip.month}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingRight: 8, paddingVertical: 2 },
  chip: {
    minWidth: 62,
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipDisabled: { opacity: 0.32, backgroundColor: colors.band },
  day: { fontSize: 10, fontFamily: font.bold, color: colors.faint },
  num: { fontSize: 18, fontFamily: font.displayBold, color: colors.ink, marginTop: 1 },
  month: { fontSize: 10, fontFamily: font.semibold, color: colors.muted },
  textActive: { color: '#fff' },
});
