export default function YarnDivider({ soft }) {
  return (
    <div className={`yarn-divider${soft ? " yarn-divider--soft" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1200 24" preserveAspectRatio="none" width="100%" height="24">
        <path d="M0,12 Q15,2 30,12 T60,12 T90,12 T120,12 T150,12 T180,12 T210,12 T240,12 T270,12 T300,12 T330,12 T360,12 T390,12 T420,12 T450,12 T480,12 T510,12 T540,12 T570,12 T600,12 T630,12 T660,12 T690,12 T720,12 T750,12 T780,12 T810,12 T840,12 T870,12 T900,12 T930,12 T960,12 T990,12 T1020,12 T1050,12 T1080,12 T1110,12 T1140,12 T1170,12 T1200,12" />
      </svg>
    </div>
  );
}
