/**
 * WebAuthn / Biometric authentication helper
 * Allows users to register and verify local device biometrics (Touch ID, Face ID, Windows Hello)
 */

export async function isBiometricsAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function registerBiometricCredential(userId = 'vault-owner'): Promise<string | null> {
  if (!(await isBiometricsAvailable())) return null;

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userIdBuffer = new TextEncoder().encode(userId);

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'VaultDirectory Secure App',
          id: window.location.hostname || 'localhost',
        },
        user: {
          id: userIdBuffer,
          name: 'vault-user',
          displayName: 'Vault Directory User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'none',
      },
    })) as PublicKeyCredential;

    if (credential && credential.id) {
      localStorage.setItem('vault_biometric_cred_id', credential.id);
      return credential.id;
    }
  } catch (err) {
    console.warn('Biometric registration was cancelled or failed:', err);
  }
  return null;
}

export async function verifyBiometricCredential(): Promise<boolean> {
  if (!(await isBiometricsAvailable())) return false;

  const credId = localStorage.getItem('vault_biometric_cred_id');
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const options: CredentialRequestOptions = {
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname || 'localhost',
        allowCredentials: credId
          ? [
              {
                id: Uint8Array.from(atob(credId), c => c.charCodeAt(0)),
                type: 'public-key',
              },
            ]
          : undefined,
      },
    };

    const assertion = await navigator.credentials.get(options);
    return !!assertion;
  } catch (err) {
    console.warn('Biometric verification cancelled or failed:', err);
    return false;
  }
}
