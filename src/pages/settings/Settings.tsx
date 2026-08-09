import { User, Palette } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs/tabs';
import { ProfileForm } from '../../components/settings/profile-form';
import { AppearanceForm } from '../../components/settings/appearance-form';

import styles from './Settings.module.css';

const settingsTabs = [
  { value: 'perfil', label: 'Perfil', icon: User },
  // { value: "seguranca", label: "Seguranca", icon: Shield },
  // { value: "notificacoes", label: "Notificacoes", icon: Bell },
  // { value: "privacidade", label: "Privacidade", icon: Eye },
  { value: 'aparencia', label: 'Aparencia', icon: Palette },
];

export default function SettingsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configurações</h1>
        <p className={styles.description}>
          Gerencie seu perfil, segurança e preferências da conta.
        </p>
      </div>

      <Tabs defaultValue="perfil" className={styles.tabsContainer}>
        <TabsList className={styles.tabsList}>
          {settingsTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={styles.tabsTrigger}
            >
              <tab.icon className={styles.icon} />
              <span className={styles.label}>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="perfil">
          <ProfileForm />
        </TabsContent>
        {/* <TabsContent value="seguranca">
          <SecurityForm />
        </TabsContent>
        <TabsContent value="notificacoes">
          <NotificationsForm />
        </TabsContent>
        <TabsContent value="privacidade">
          <PrivacyForm />
        </TabsContent> */}
        <TabsContent value="aparencia">
          <AppearanceForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
