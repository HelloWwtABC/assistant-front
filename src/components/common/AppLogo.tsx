interface AppLogoProps {
  collapsed?: boolean;
  variant?: 'dark' | 'light';
}

export function AppLogo({
  collapsed = false,
  variant = 'dark',
}: AppLogoProps) {
  return (
    <div className={`app-logo app-logo--${variant}`}>
      <div className="app-logo__mark">AI</div>

      {!collapsed && (
        <div className="app-logo__content">
          <div className="app-logo__title">Agent Hub</div>
          <div className="app-logo__subtitle">Knowledge & Ticket Ops</div>
        </div>
      )}
    </div>
  );
}
