# 🌍 Fichiers de Traduction Manquants

Ce document contient les fichiers de traduction JSON pour les langues restantes à ajouter.

---

## 📁 Fichiers à Créer

1. `messages/de.json` - Allemand
2. `messages/it.json` - Italien  
3. `messages/tr.json` - Turc
4. `messages/en-US.json` - Anglais américain (distinct de en)

---

## 🇩🇪 Allemand (de.json)

Créer le fichier : `messages/de.json`

```json
{
  "nav": {
    "home": "Startseite",
    "explore": "Entdecken",
    "profile": "Mein Profil",
    "dashboard": "Dashboard",
    "login": "Anmelden",
    "signup": "Registrieren",
    "logout": "Abmelden",
    "myVoyages": "Meine Reisen"
  },
  "home": {
    "hero": {
      "title": "Laufe für dich,",
      "subtitle": "nicht für die Statistiken.",
      "description": "Entdecke Cosmic Run, das Ökosystem, in dem Geschwindigkeit keine Rolle spielt. Plane, reise und teile deine Läufe ohne Leistungsdruck.",
      "cta": "Ausflüge Erkunden",
      "philosophy": "Unsere Philosophie"
    },
    "features": {
      "title": "Anti-Performance",
      "subtitle": "Wir haben die Stoppuhren entfernt (fast). Hier feiern wir Regelmäßigkeit, Entdeckung und Begegnungen.",
      "socialRun": {
        "title": "Social Trip Running",
        "description": "Strukturierte Laufreisen, um die Welt oder deine Region zu entdecken. Unterkunft, Strecken und gute Stimmung inklusive."
      },
      "agenda": {
        "title": "Zentralisierte Agenda",
        "description": "Keine WhatsApp-Gruppen mehr. Finde alle deine Trainings, offiziellen Rennen und sozialen Ausflüge an einem Ort."
      },
      "coach": {
        "title": "Freundlicher Coach",
        "description": "Trainingspläne, die sich an dein Leben anpassen, nicht umgekehrt. Ziel: sich wohl fühlen, keinen Rekord brechen."
      }
    },
    "cta": {
      "title": "Tritt der Bewegung bei",
      "description": "Die App wird gerade gebaut. Melde dich an für privaten Beta-Zugang und erste Reisen.",
      "emailPlaceholder": "deine@email.com",
      "subscribe": "Anmelden"
    },
    "footer": {
      "copyright": "© 2025 Cosmic Run. Alle Rechte vorbehalten. Das globale Läufer-Ökosystem."
    }
  },
  "explore": {
    "title": "Kommende Abfahrten",
    "description": "Tritt einer Gruppe bei, laufe ohne Druck und entdecke neue Horizonte.",
    "back": "Zurück",
    "filters": {
      "all": "Alle",
      "socialRun": "Social Run",
      "trip": "Reise",
      "thematic": "Thematisch"
    }
  },
  "voyage": {
    "bookingButton": {
      "login": "Anmelden um teilzunehmen",
      "booked": "✅ Du bist dabei!",
      "full": "❌ Voll",
      "book": "Ich bin dabei!",
      "booking": "Buchung läuft..."
    },
    "details": {
      "date": "Datum",
      "location": "Ort",
      "duration": "Dauer",
      "level": "Level",
      "allLevels": "Alle Level",
      "about": "Über",
      "organizedBy": "Organisiert von",
      "pricePerPerson": "Preis pro Person",
      "free": "Kostenlos",
      "cancellation": "Kostenlose Stornierung bis 24h vorher.",
      "participants": "Teilnehmer"
    }
  },
  "profile": {
    "greeting": "Hallo {name},",
    "subtitle": "Bereit für deinen nächsten Lauf?",
    "upcoming": "🗓️ Deine kommenden Abenteuer",
    "emptyState": {
      "title": "Noch kein Rennen geplant?",
      "description": "Deine Agenda ist leer, aber die Welt ist groß. Finde jetzt deinen nächsten \"Social Run\".",
      "cta": "Reisen erkunden"
    },
    "past": "Erinnerungen (Vergangene)"
  },
  "auth": {
    "login": {
      "title": "Willkommen zurück!",
      "subtitle": "Melde dich an, um auf deinen Bereich zuzugreifen.",
      "email": "Email",
      "password": "Passwort",
      "rememberMe": "Angemeldet bleiben",
      "submit": "Anmelden",
      "submitting": "Anmeldung läuft...",
      "noAccount": "Noch kein Konto?",
      "signupLink": "Registrieren"
    },
    "register": {
      "title": "Tritt der Community bei",
      "subtitle": "Erstelle dein Konto zum Organisieren oder Teilnehmen.",
      "fullName": "Vollständiger Name",
      "email": "Email",
      "password": "Passwort",
      "role": "Ich bin...",
      "runner": "Läufer",
      "organizer": "Organisator",
      "submit": "Registrieren",
      "submitting": "Konto wird erstellt...",
      "hasAccount": "Schon ein Konto?",
      "loginLink": "Anmelden"
    }
  },
  "organizer": {
    "dashboard": {
      "title": "Dashboard",
      "subtitle": "Verwalte deine Events und verfolge Anmeldungen.",
      "newVoyage": "Neue Reise",
      "stats": {
        "totalParticipants": "Gesamtregistrierte",
        "activeVoyages": "Aktive Reisen",
        "revenue": "Einnahmen (Geschätzt)"
      },
      "myVoyages": "Meine Reisen",
      "emptyState": {
        "message": "Du hast noch keine Reisen erstellt.",
        "cta": "Los geht's!"
      }
    },
    "create": {
      "title": "Event erstellen",
      "subtitle": "Fülle die Details aus, um eine neue Reise zum Ökosystem hinzuzufügen.",
      "fields": {
        "title": "Reisetitel",
        "titlePlaceholder": "Z.B.: Nächtliche Paris-Überquerung",
        "description": "Beschreibung",
        "descriptionPlaceholder": "Beschreibe die Atmosphäre, die Route...",
        "date": "Datum",
        "location": "Ort",
        "locationPlaceholder": "Z.B.: Bordeaux, Frankreich",
        "type": "Typ",
        "types": {
          "socialRun": "Social Run",
          "thematic": "Thematisch",
          "tripMultiDay": "Reise (Mehrtägig)"
        },
        "duration": "Dauer",
        "durationPlaceholder": "Z.B.: 2h00",
        "price": "Preis (€)",
        "imageUrl": "Bild-URL"
      },
      "submit": "Reise Veröffentlichen"
    },
    "layout": {
      "title": "Cosmic Pro",
      "dashboard": "Dashboard",
      "createVoyage": "Reise Erstellen",
      "quitPro": "Pro-Bereich Verlassen"
    }
  },
  "common": {
    "loading": "Lädt...",
    "error": "Ein Fehler ist aufgetreten",
    "save": "Speichern",
    "cancel": "Abbrechen",
    "delete": "Löschen",
    "edit": "Bearbeiten",
    "back": "Zurück"
  }
}
```

---

## 🇮🇹 Italien (it.json)

Créer le fichier : `messages/it.json`

```json
{
  "nav": {
    "home": "Home",
    "explore": "Esplora",
    "profile": "Il Mio Profilo",
    "dashboard": "Dashboard",
    "login": "Accedi",
    "signup": "Registrati",
    "logout": "Esci",
    "myVoyages": "I Miei Viaggi"
  },
  "home": {
    "hero": {
      "title": "Corri per te,",
      "subtitle": "non per le statistiche.",
      "description": "Scopri Cosmic Run, l'ecosistema dove la velocità non conta. Pianifica, viaggia e condividi le tue corse senza pressione delle prestazioni.",
      "cta": "Esplora le Uscite",
      "philosophy": "La Nostra Filosofia"
    },
    "features": {
      "title": "Anti-Performance",
      "subtitle": "Abbiamo rimosso i cronometri (quasi). Qui celebriamo la regolarità, la scoperta e gli incontri.",
      "socialRun": {
        "title": "Social Trip Running",
        "description": "Viaggi di corsa strutturati per scoprire il mondo o la tua regione. Alloggio, percorsi e buona atmosfera inclusi."
      },
      "agenda": {
        "title": "Agenda Centralizzata",
        "description": "Basta gruppi WhatsApp. Trova tutti i tuoi allenamenti, gare ufficiali e uscite sociali in un unico posto."
      },
      "coach": {
        "title": "Coach Gentile",
        "description": "Piani di allenamento che si adattano alla tua vita, non il contrario. Obiettivo: sentirsi bene, non battere un record."
      }
    },
    "cta": {
      "title": "Unisciti al movimento",
      "description": "L'app è in costruzione. Iscriviti per accedere alla beta privata e ai primi viaggi.",
      "emailPlaceholder": "tua@email.com",
      "subscribe": "Iscrivimi"
    },
    "footer": {
      "copyright": "© 2025 Cosmic Run. Tutti i diritti riservati. L'ecosistema globale del corridore."
    }
  },
  "explore": {
    "title": "Prossime Partenze",
    "description": "Unisciti a un gruppo, corri senza pressione e scopri nuovi orizzonti.",
    "back": "Indietro",
    "filters": {
      "all": "Tutto",
      "socialRun": "Social Run",
      "trip": "Viaggio",
      "thematic": "Tematico"
    }
  },
  "voyage": {
    "bookingButton": {
      "login": "Accedi per partecipare",
      "booked": "✅ Ci sei!",
      "full": "❌ Completo",
      "book": "Partecipo!",
      "booking": "Prenotazione..."
    },
    "details": {
      "date": "Data",
      "location": "Luogo",
      "duration": "Durata",
      "level": "Livello",
      "allLevels": "Tutti i livelli",
      "about": "Informazioni",
      "organizedBy": "Organizzato da",
      "pricePerPerson": "Prezzo per persona",
      "free": "Gratuito",
      "cancellation": "Cancellazione gratuita fino a 24h prima.",
      "participants": "partecipanti"
    }
  },
  "profile": {
    "greeting": "Ciao {name},",
    "subtitle": "Pronto per la tua prossima corsa?",
    "upcoming": "🗓️ Le tue prossime avventure",
    "emptyState": {
      "title": "Nessuna gara pianificata?",
      "description": "La tua agenda è vuota, ma il mondo è grande. Trova la tua prossima \"Social Run\" ora.",
      "cta": "Esplora i viaggi"
    },
    "past": "Ricordi (Passati)"
  },
  "auth": {
    "login": {
      "title": "Bentornato!",
      "subtitle": "Accedi per accedere al tuo spazio.",
      "email": "Email",
      "password": "Password",
      "rememberMe": "Ricordami",
      "submit": "Accedi",
      "submitting": "Accesso in corso...",
      "noAccount": "Non hai un account?",
      "signupLink": "Registrati"
    },
    "register": {
      "title": "Unisciti alla community",
      "subtitle": "Crea il tuo account per organizzare o partecipare.",
      "fullName": "Nome completo",
      "email": "Email",
      "password": "Password",
      "role": "Sono...",
      "runner": "Corridore",
      "organizer": "Organizzatore",
      "submit": "Registrati",
      "submitting": "Creazione account...",
      "hasAccount": "Hai già un account?",
      "loginLink": "Accedi"
    }
  },
  "organizer": {
    "dashboard": {
      "title": "Dashboard",
      "subtitle": "Gestisci i tuoi eventi e segui le iscrizioni.",
      "newVoyage": "Nuovo Viaggio",
      "stats": {
        "totalParticipants": "Totale Iscritti",
        "activeVoyages": "Viaggi Attivi",
        "revenue": "Entrate (Stimate)"
      },
      "myVoyages": "I Miei Viaggi",
      "emptyState": {
        "message": "Non hai ancora creato viaggi.",
        "cta": "Inizia!"
      }
    },
    "create": {
      "title": "Crea un evento",
      "subtitle": "Compila i dettagli per aggiungere un nuovo viaggio all'ecosistema.",
      "fields": {
        "title": "Titolo del viaggio",
        "titlePlaceholder": "Es: Attraversata Notturna di Parigi",
        "description": "Descrizione",
        "descriptionPlaceholder": "Descrivi l'atmosfera, il percorso...",
        "date": "Data",
        "location": "Luogo",
        "locationPlaceholder": "Es: Bordeaux, Francia",
        "type": "Tipo",
        "types": {
          "socialRun": "Social Run",
          "thematic": "Tematico",
          "tripMultiDay": "Viaggio (Multi-giorni)"
        },
        "duration": "Durata",
        "durationPlaceholder": "Es: 2h00",
        "price": "Prezzo (€)",
        "imageUrl": "URL immagine"
      },
      "submit": "Pubblica Viaggio"
    },
    "layout": {
      "title": "Cosmic Pro",
      "dashboard": "Dashboard",
      "createVoyage": "Crea Viaggio",
      "quitPro": "Esci dallo spazio Pro"
    }
  },
  "common": {
    "loading": "Caricamento...",
    "error": "Si è verificato un errore",
    "save": "Salva",
    "cancel": "Annulla",
    "delete": "Elimina",
    "edit": "Modifica",
    "back": "Indietro"
  }
}
```

---

## 🇹🇷 Turc (tr.json)

Créer le fichier : `messages/tr.json`

```json
{
  "nav": {
    "home": "Ana Sayfa",
    "explore": "Keşfet",
    "profile": "Profilim",
    "dashboard": "Kontrol Paneli",
    "login": "Giriş Yap",
    "signup": "Kayıt Ol",
    "logout": "Çıkış Yap",
    "myVoyages": "Gezilerim"
  },
  "home": {
    "hero": {
      "title": "Kendin için koş,",
      "subtitle": "istatistikler için değil.",
      "description": "Cosmic Run'ı keşfedin, hızın önemli olmadığı ekosistem. Performans baskısı olmadan koşularınızı planlayın, seyahat edin ve paylaşın.",
      "cta": "Gezileri Keşfet",
      "philosophy": "Felsefemiz"
    },
    "features": {
      "title": "Anti-Performans",
      "subtitle": "Kronometreleri kaldırdık (neredeyse). Burada düzenlilik, keşif ve buluşmaları kutlarız.",
      "socialRun": {
        "title": "Sosyal Koşu Gezisi",
        "description": "Dünyayı veya bölgenizi keşfetmek için yapılandırılmış koşu gezileri. Konaklama, rotalar ve iyi atmosfer dahil."
      },
      "agenda": {
        "title": "Merkezi Ajanda",
        "description": "WhatsApp gruplarına son. Tüm antrenmanlarınızı, resmi yarışlarınızı ve sosyal çıkışlarınızı tek yerde bulun."
      },
      "coach": {
        "title": "Nazik Koç",
        "description": "Hayatınıza uyum sağlayan antrenman planları, tersi değil. Hedef: iyi hissetmek, rekor kırmak değil."
      }
    },
    "cta": {
      "title": "Harekete katıl",
      "description": "Uygulama yapım aşamasında. Özel beta erişimi ve ilk geziler için kaydolun.",
      "emailPlaceholder": "senin@email.com",
      "subscribe": "Kaydol"
    },
    "footer": {
      "copyright": "© 2025 Cosmic Run. Tüm hakları saklıdır. Küresel koşucu ekosistemi."
    }
  },
  "explore": {
    "title": "Yaklaşan Kalkışlar",
    "description": "Bir gruba katıl, baskı olmadan koş ve yeni ufuklar keşfet.",
    "back": "Geri",
    "filters": {
      "all": "Tümü",
      "socialRun": "Sosyal Koşu",
      "trip": "Gezi",
      "thematic": "Tematik"
    }
  },
  "voyage": {
    "bookingButton": {
      "login": "Katılmak için giriş yap",
      "booked": "✅ Katılıyorsun!",
      "full": "❌ Dolu",
      "book": "Katılıyorum!",
      "booking": "Rezervasyon yapılıyor..."
    },
    "details": {
      "date": "Tarih",
      "location": "Konum",
      "duration": "Süre",
      "level": "Seviye",
      "allLevels": "Tüm seviyeler",
      "about": "Hakkında",
      "organizedBy": "Düzenleyen",
      "pricePerPerson": "Kişi başı fiyat",
      "free": "Ücretsiz",
      "cancellation": "24 saat öncesine kadar ücretsiz iptal.",
      "participants": "katılımcı"
    }
  },
  "profile": {
    "greeting": "Merhaba {name},",
    "subtitle": "Bir sonraki koşuna hazır mısın?",
    "upcoming": "🗓️ Yaklaşan maceralarınız",
    "emptyState": {
      "title": "Henüz planlanmış yarış yok mu?",
      "description": "Ajandanız boş, ama dünya büyük. Bir sonraki \"Sosyal Koşu\"nuzu şimdi bulun.",
      "cta": "Gezileri keşfet"
    },
    "past": "Anılar (Geçmiş)"
  },
  "auth": {
    "login": {
      "title": "Tekrar hoş geldin!",
      "subtitle": "Alanınıza erişmek için giriş yapın.",
      "email": "E-posta",
      "password": "Şifre",
      "rememberMe": "Beni hatırla",
      "submit": "Giriş yap",
      "submitting": "Giriş yapılıyor...",
      "noAccount": "Henüz hesabınız yok mu?",
      "signupLink": "Kayıt ol"
    },
    "register": {
      "title": "Topluluğa katıl",
      "subtitle": "Organize etmek veya katılmak için hesabınızı oluşturun.",
      "fullName": "Tam ad",
      "email": "E-posta",
      "password": "Şifre",
      "role": "Ben...",
      "runner": "Koşucu",
      "organizer": "Organizatör",
      "submit": "Kayıt ol",
      "submitting": "Hesap oluşturuluyor...",
      "hasAccount": "Zaten hesabınız var mı?",
      "loginLink": "Giriş yap"
    }
  },
  "organizer": {
    "dashboard": {
      "title": "Kontrol Paneli",
      "subtitle": "Etkinliklerinizi yönetin ve kayıtları takip edin.",
      "newVoyage": "Yeni Gezi",
      "stats": {
        "totalParticipants": "Toplam Kayıtlı",
        "activeVoyages": "Aktif Geziler",
        "revenue": "Gelir (Tahmini)"
      },
      "myVoyages": "Gezilerim",
      "emptyState": {
        "message": "Henüz gezi oluşturmadınız.",
        "cta": "Başlayın!"
      }
    },
    "create": {
      "title": "Etkinlik oluştur",
      "subtitle": "Ekosisteme yeni bir gezi eklemek için ayrıntıları doldurun.",
      "fields": {
        "title": "Gezi başlığı",
        "titlePlaceholder": "Örn: Paris Gece Geçişi",
        "description": "Açıklama",
        "descriptionPlaceholder": "Atmosferi, rotayı açıklayın...",
        "date": "Tarih",
        "location": "Konum",
        "locationPlaceholder": "Örn: Bordeaux, Fransa",
        "type": "Tür",
        "types": {
          "socialRun": "Sosyal Koşu",
          "thematic": "Tematik",
          "tripMultiDay": "Gezi (Çok günlü)"
        },
        "duration": "Süre",
        "durationPlaceholder": "Örn: 2s00",
        "price": "Fiyat (€)",
        "imageUrl": "Resim URL'si"
      },
      "submit": "Geziyi Yayınla"
    },
    "layout": {
      "title": "Cosmic Pro",
      "dashboard": "Kontrol Paneli",
      "createVoyage": "Gezi Oluştur",
      "quitPro": "Pro alanından çık"
    }
  },
  "common": {
    "loading": "Yükleniyor...",
    "error": "Bir hata oluştu",
    "save": "Kaydet",
    "cancel": "İptal",
    "delete": "Sil",
    "edit": "Düzenle",
    "back": "Geri"
  }
}
```

---

## 🇺🇸 Anglais Américain (en-US.json)

Créer le fichier : `messages/en-US.json`

**Note**: Similaire à `en.json` mais avec quelques différences d'orthographe américaine

```json
{
  "nav": {
    "home": "Home",
    "explore": "Explore",
    "profile": "My Profile",
    "dashboard": "Dashboard",
    "login": "Login",
    "signup": "Sign up",
    "logout": "Logout",
    "myVoyages": "My Trips"
  },
  "home": {
    "hero": {
      "title": "Run for yourself,",
      "subtitle": "not for the stats.",
      "description": "Discover Cosmic Run, the ecosystem where speed doesn't matter. Plan, travel, and share your runs without performance pressure.",
      "cta": "Explore Trips",
      "philosophy": "Our Philosophy"
    },
    "features": {
      "title": "Anti-Performance",
      "subtitle": "We removed the stopwatches (almost). Here, we celebrate consistency, discovery and connections.",
      "socialRun": {
        "title": "Social Trip Running",
        "description": "Structured running trips to discover the world or your region. Accommodation, routes and good vibes included."
      },
      "agenda": {
        "title": "Centralized Agenda",
        "description": "No more WhatsApp groups. Find all your trainings, official races and social outings in one place."
      },
      "coach": {
        "title": "Kind Coach",
        "description": "Training plans that adapt to your life, not the other way around. Goal: feel good, not break a record."
      }
    },
    "cta": {
      "title": "Join the movement",
      "description": "The app is under construction. Sign up for private beta access and first trips.",
      "emailPlaceholder": "your@email.com",
      "subscribe": "Sign me up"
    },
    "footer": {
      "copyright": "© 2025 Cosmic Run. All rights reserved. The global runner's ecosystem."
    }
  },
  "explore": {
    "title": "Upcoming Departures",
    "description": "Join a group, run without pressure and discover new horizons.",
    "back": "Back",
    "filters": {
      "all": "All",
      "socialRun": "Social Run",
      "trip": "Trip",
      "thematic": "Thematic"
    }
  },
  "voyage": {
    "bookingButton": {
      "login": "Login to participate",
      "booked": "✅ You're in!",
      "full": "❌ Full",
      "book": "Join!",
      "booking": "Booking..."
    },
    "details": {
      "date": "Date",
      "location": "Location",
      "duration": "Duration",
      "level": "Level",
      "allLevels": "All levels",
      "about": "About",
      "organizedBy": "Organized by",
      "pricePerPerson": "Price per person",
      "free": "Free",
      "cancellation": "Free cancellation up to 24h before.",
      "participants": "participants"
    }
  },
  "profile": {
    "greeting": "Hello {name},",
    "subtitle": "Ready for your next run?",
    "upcoming": "🗓️ Your upcoming adventures",
    "emptyState": {
      "title": "No race planned yet?",
      "description": "Your agenda is empty, but the world is big. Find your next \"Social Run\" now.",
      "cta": "Explore trips"
    },
    "past": "Memories (Past)"
  },
  "auth": {
    "login": {
      "title": "Welcome back!",
      "subtitle": "Login to access your space.",
      "email": "Email",
      "password": "Password",
      "rememberMe": "Remember me",
      "submit": "Login",
      "submitting": "Logging in...",
      "noAccount": "No account yet?",
      "signupLink": "Sign up"
    },
    "register": {
      "title": "Join the community",
      "subtitle": "Create your account to organize or participate.",
      "fullName": "Full name",
      "email": "Email",
      "password": "Password",
      "role": "I am...",
      "runner": "Runner",
      "organizer": "Organizer",
      "submit": "Sign up",
      "submitting": "Creating account...",
      "hasAccount": "Already have an account?",
      "loginLink": "Login"
    }
  },
  "organizer": {
    "dashboard": {
      "title": "Dashboard",
      "subtitle": "Manage your events and track registrations.",
      "newVoyage": "New Trip",
      "stats": {
        "totalParticipants": "Total Registered",
        "activeVoyages": "Active Trips",
        "revenue": "Revenue (Est.)"
      },
      "myVoyages": "My Trips",
      "emptyState": {
        "message": "You haven't created any trips yet.",
        "cta": "Get started!"
      }
    },
    "create": {
      "title": "Create an event",
      "subtitle": "Fill in the details to add a new trip to the ecosystem.",
      "fields": {
        "title": "Trip title",
        "titlePlaceholder": "Ex: Paris Night Crossing",
        "description": "Description",
        "descriptionPlaceholder": "Describe the vibe, the route...",
        "date": "Date",
        "location": "Location",
        "locationPlaceholder": "Ex: Bordeaux, France",
        "type": "Type",
        "types": {
          "socialRun": "Social Run",
          "thematic": "Thematic",
          "tripMultiDay": "Trip (Multi-day)"
        },
        "duration": "Duration",
        "durationPlaceholder": "Ex: 2h00",
        "price": "Price (€)",
        "imageUrl": "Image URL"
      },
      "submit": "Publish Trip"
    },
    "layout": {
      "title": "Cosmic Pro",
      "dashboard": "Dashboard",
      "createVoyage": "Create Trip",
      "quitPro": "Exit Pro Space"
    }
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "back": "Back"
  }
}
```

---

## ⚡ Instructions

1. Créer les 4 fichiers dans le dossier `messages/`
2. Cop

ier-coller le contenu JSON pour chaque langue
3. Enregistrer les fichiers

Une fois fait, toutes les 7 langues seront disponibles :
- ✅ en (Anglais UK) - déjà créé
- ✅ fr (Français) - déjà créé  
- ✅ es (Espagnol) - déjà créé
- ⏳ de (Allemand) - à créer
- ⏳ it (Italien) - à créer
- ⏳ tr (Turc) - à créer
- ⏳ en-US (Anglais US) - à créer

---

## 📝 Note

Ces traductions ont été faites avec soin pour respecter les nuances culturelles de chaque langue. Vous pouvez les ajuster selon vos préférences !
