
// This file is no longer used as City Settings are now part of /admin/system-config
// You can delete this file.
// Keeping it temporarily to avoid breaking existing references if any, but its content is moved to CitySettingsSection.tsx

export default function DeprecatedCitySettingsPage() {
  return (
    <div>
      <h1>City Settings Moved</h1>
      <p>City settings are now managed under "System Config" in the Admin Panel.</p>
      <a href="/admin/system-config">Go to System Config</a>
    </div>
  );
}
