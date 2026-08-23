import { getSettingsStatus } from "@/lib/settings";
import SettingsForm from "./SettingsForm";

export default async function ConfiguracoesPage() {
  const status = await getSettingsStatus(["mp_access_token", "mp_public_key", "mp_webhook_secret"]);

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "8px" }}>Configurações</h1>
      <p className="contact-text" style={{ marginBottom: "32px" }}>
        As chaves ficam guardadas no banco de dados, protegidas — nunca aparecem no
        navegador nem em nenhum arquivo do site.
      </p>
      <SettingsForm status={status} />
    </div>
  );
}
