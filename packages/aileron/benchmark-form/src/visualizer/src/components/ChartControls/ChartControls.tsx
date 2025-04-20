import styles from './ChartControls.module.css';

interface ChartControlsProps {
  showGenieForm: boolean;
  showBar: boolean;
  showLine: boolean;
  showTrendline: boolean;
  onToggleGenieForm: () => void;
  onToggleBar: () => void;
  onToggleLine: () => void;
  onToggleTrendline: () => void;
}

export function ChartControls({
  showGenieForm,
  showBar,
  showLine,
  showTrendline,
  onToggleGenieForm,
  onToggleBar,
  onToggleLine,
  onToggleTrendline,
}: ChartControlsProps) {
  return (
    <div className={styles.controls}>
      <label className={styles.control}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={showGenieForm}
          onChange={onToggleGenieForm}
        />
        <span className={styles.label}>Genie Form</span>
      </label>
      <label className={styles.control}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={showBar}
          onChange={onToggleBar}
        />
        <span className={styles.label}>막대 그래프</span>
      </label>
      <label className={styles.control}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={showLine}
          onChange={onToggleLine}
        />
        <span className={styles.label}>꺾은선 그래프</span>
      </label>
      <label className={styles.control}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={showTrendline}
          onChange={onToggleTrendline}
        />
        <span className={styles.label}>추세선</span>
      </label>
    </div>
  );
}
