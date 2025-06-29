import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage
});

// Konfiguracja OAuth dla Managed Login z domeną auth.kantux.com
backend.addOutput({
  auth: {
    oauth: {
      domain: "auth.kantux.com",
      scopes: ["openid", "email", "profile"],
      redirect_sign_in_uri: [
        "http://localhost:5173/",  // dla development
        "https://auth.kantux.com/"      // dla production
      ],
      redirect_sign_out_uri: [
        "http://localhost:5173/",  // dla development  
        "https://auth.kantux.com/"      // dla production
      ],
      response_type: "code",
      identity_providers: []
    }
  }
});