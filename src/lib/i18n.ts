export type Locale = "en" | "fr";

const translations = {
  // Common
  "app.name": { en: "YARDA", fr: "YARDA" },
  "app.subtitle": { en: "Fraud Detection Platform", fr: "Plateforme de Détection de Fraude" },
  "app.version": { en: "YARDA v1.0.0", fr: "YARDA v1.0.0" },

  // Login
  "login.title": { en: "YARDA", fr: "YARDA" },
  "login.email": { en: "Email", fr: "Email" },
  "login.emailPlaceholder": { en: "you@example.com", fr: "vous@exemple.com" },
  "login.password": { en: "Password", fr: "Mot de passe" },
  "login.passwordPlaceholder": { en: "Enter your password", fr: "Entrez votre mot de passe" },
  "login.signIn": { en: "Sign In", fr: "Se Connecter" },
  "login.signingIn": { en: "Signing in...", fr: "Connexion..." },
  "login.fieldsRequired": { en: "Email and password required", fr: "Email et mot de passe requis" },
  "login.invalidCredentials": {
    en: "Invalid email or password",
    fr: "Email ou mot de passe invalide",
  },
  "login.networkError": {
    en: "Connection error. Try again.",
    fr: "Erreur de connexion. Réessayez.",
  },
  // Legacy (kept for compat)
  "login.clientId": { en: "Client ID", fr: "Identifiant Client" },
  "login.clientIdPlaceholder": { en: "e.g. sako", fr: "ex. sako" },
  "login.apiKey": { en: "API Key", fr: "Clé API" },
  "login.apiKeyPlaceholder": { en: "Your API key", fr: "Votre clé API" },
  "login.clientIdRequired": { en: "Client ID is required", fr: "L'identifiant client est requis" },

  // Sidebar navigation
  "nav.overview": { en: "Overview", fr: "Vue d'ensemble" },
  "nav.transactions": { en: "Transactions", fr: "Transactions" },
  "nav.analytics": { en: "Analytics", fr: "Analytique" },
  "nav.reviewQueue": { en: "Review Queue", fr: "File de Révision" },
  "nav.models": { en: "Models", fr: "Modèles" },
  "nav.settings": { en: "Settings", fr: "Paramètres" },
  "nav.signOut": { en: "Sign Out", fr: "Déconnexion" },
  "nav.fraudDetection": { en: "Fraud Detection", fr: "Détection de Fraude" },

  // Header / Period
  "period.24h": { en: "24h", fr: "24h" },
  "period.7d": { en: "7d", fr: "7j" },
  "period.30d": { en: "30d", fr: "30j" },
  "period.90d": { en: "90d", fr: "90j" },

  // KPI titles
  "kpi.transactions": { en: "Transactions", fr: "Transactions" },
  "kpi.flagged": { en: "Flagged", fr: "Signalées" },
  "kpi.ofTotal": { en: "of total", fr: "du total" },
  "kpi.riskScore": { en: "Risk Score", fr: "Score de Risque" },
  "kpi.average": { en: "Average", fr: "Moyenne" },
  "kpi.latency": { en: "Latency", fr: "Latence" },
  "kpi.avgInference": { en: "Avg inference", fr: "Inférence moy." },
  "kpi.phase": { en: "Phase", fr: "Phase" },
  "kpi.labels": { en: "labels", fr: "labels" },
  "kpi.pendingReview": { en: "Pending Review", fr: "En Attente de Révision" },

  // Decisions
  "decision.allow": { en: "Allow", fr: "Autorisé" },
  "decision.review": { en: "Review", fr: "Révision" },
  "decision.alert": { en: "Alert", fr: "Alerte" },
  "decision.block": { en: "Block", fr: "Bloqué" },
  "decision.allDecisions": { en: "All decisions", fr: "Toutes les décisions" },

  // Phases
  "phase.detection": { en: "Detection", fr: "Détection" },
  "phase.learning": { en: "Learning", fr: "Apprentissage" },
  "phase.classification": { en: "Classification", fr: "Classification" },
  "phase.intelligence": { en: "Intelligence", fr: "Intelligence" },

  // Charts
  "chart.transactionVolume": { en: "Transaction Volume", fr: "Volume de Transactions" },
  "chart.decisionBreakdown": { en: "Decision Breakdown", fr: "Répartition des Décisions" },
  "chart.scoreDistribution": { en: "Score Distribution", fr: "Distribution des Scores" },
  "chart.total": { en: "Total", fr: "Total" },
  "chart.flagged": { en: "Flagged", fr: "Signalées" },

  // Transactions page
  "transactions.title": { en: "Transactions", fr: "Transactions" },
  "transactions.filters": { en: "Filters", fr: "Filtres" },
  "transactions.transaction": { en: "Transaction", fr: "Transaction" },
  "transactions.decision": { en: "Decision", fr: "Décision" },
  "transactions.score": { en: "Score", fr: "Score" },
  "transactions.anomaly": { en: "Anomaly", fr: "Anomalie" },
  "transactions.mlScore": { en: "ML Score", fr: "Score ML" },
  "transactions.latency": { en: "Latency", fr: "Latence" },
  "transactions.phase": { en: "Phase", fr: "Phase" },
  "transactions.label": { en: "Label", fr: "Étiquette" },
  "transactions.labeled": { en: "Labeled", fr: "Étiquetée" },
  "transactions.time": { en: "Time", fr: "Date" },
  "transactions.noData": {
    en: "No transactions found for this period",
    fr: "Aucune transaction trouvée pour cette période",
  },
  "transactions.loading": { en: "Loading...", fr: "Chargement..." },
  "sort.newest": { en: "Newest first", fr: "Plus récentes" },
  "sort.oldest": { en: "Oldest first", fr: "Plus anciennes" },
  "sort.scoreDesc": { en: "Highest score", fr: "Score le plus élevé" },
  "sort.scoreAsc": { en: "Lowest score", fr: "Score le plus bas" },
  "filter.allLabels": { en: "All labels", fr: "Tous les labels" },
  "filter.labeled": { en: "Labeled", fr: "Étiquetées" },
  "filter.unlabeled": { en: "Unlabeled", fr: "Non étiquetées" },

  // Analytics page
  "analytics.title": { en: "Analytics", fr: "Analytique" },
  "analytics.peakHours": { en: "Peak Activity Hours (UTC)", fr: "Heures de Pointe (UTC)" },
  "analytics.labelDistribution": { en: "Label Distribution", fr: "Distribution des Labels" },
  "analytics.totalLabeled": { en: "Total Labeled", fr: "Total Étiquetés" },
  "analytics.fraud": { en: "Fraud", fr: "Fraude" },
  "analytics.legitimate": { en: "Legitimate", fr: "Légitime" },
  "analytics.modelPerformance": { en: "Model Performance", fr: "Performance du Modèle" },
  "analytics.precision": { en: "Precision", fr: "Précision" },
  "analytics.recall": { en: "Recall", fr: "Rappel" },
  "analytics.f1Score": { en: "F1 Score", fr: "Score F1" },
  "analytics.accuracy": { en: "Accuracy", fr: "Exactitude" },
  "analytics.confusionMatrix": { en: "Confusion Matrix", fr: "Matrice de Confusion" },
  "analytics.truePositive": { en: "True Positive", fr: "Vrai Positif" },
  "analytics.falseNegative": { en: "False Negative", fr: "Faux Négatif" },
  "analytics.falsePositive": { en: "False Positive", fr: "Faux Positif" },
  "analytics.trueNegative": { en: "True Negative", fr: "Vrai Négatif" },
  "analytics.predictedFraud": { en: "Predicted Fraud", fr: "Fraude Prédite" },
  "analytics.predictedLegit": { en: "Predicted Legit", fr: "Légitime Prédit" },
  "analytics.actualFraud": { en: "Actual Fraud", fr: "Fraude Réelle" },
  "analytics.actualLegit": { en: "Actual Legit", fr: "Légitime Réel" },

  // Review page
  "review.title": { en: "Review Queue", fr: "File de Révision" },
  "review.riskScore": { en: "Risk Score", fr: "Score de Risque" },
  "review.topRiskFactors": { en: "Top Risk Factors", fr: "Principaux Facteurs de Risque" },
  "review.pendingReview": {
    en: "transactions pending review",
    fr: "transactions en attente de révision",
  },
  "review.allCaughtUp": {
    en: "No pending reviews \u2014 all caught up!",
    fr: "Aucune révision en attente \u2014 tout est à jour !",
  },

  // Models page
  "models.title": { en: "Production Models", fr: "Modèles en Production" },
  "models.clientSpecific": { en: "Client-specific", fr: "Spécifique client" },
  "models.noModels": { en: "No production models found", fr: "Aucun modèle en production" },
  "models.noModelsDesc": {
    en: "Models will appear here after training and promotion to production",
    fr: "Les modèles apparaîtront ici après entraînement et mise en production",
  },
  "models.classifierPerformance": {
    en: "Classifier Performance",
    fr: "Performance du Classifieur",
  },
  "models.anomalyDetection": { en: "Anomaly Detection", fr: "Détection d'Anomalies" },
  "models.confusionMatrix": { en: "Confusion Matrix", fr: "Matrice de Confusion" },
  "models.featureImportance": { en: "Feature Importance", fr: "Importance des Variables" },
  "models.hyperparameters": { en: "Hyperparameters", fr: "Hyperparamètres" },
  "models.showAll": { en: "Show all", fr: "Tout afficher" },
  "models.showLess": { en: "Show less", fr: "Réduire" },
  "models.viewInComet": { en: "View in Comet", fr: "Voir dans Comet" },
  "models.cometUnavailable": {
    en: "Experiment tracking data unavailable — showing registry data only",
    fr: "Données de suivi d'expériences indisponibles — données du registre uniquement",
  },
  "models.truePositive": { en: "True Positive", fr: "Vrai Positif" },
  "models.trueNegative": { en: "True Negative", fr: "Vrai Négatif" },
  "models.falsePositive": { en: "False Positive", fr: "Faux Positif" },
  "models.falseNegative": { en: "False Negative", fr: "Faux Négatif" },
  "models.threshold": { en: "Threshold", fr: "Seuil" },
  "models.anomalyRate": { en: "Anomaly Rate", fr: "Taux d'Anomalies" },
  "models.scoreDist": { en: "Score Distribution", fr: "Distribution des Scores" },
  "models.modelArtifacts": { en: "Model Artifacts", fr: "Artéfacts du Modèle" },
  "models.deployedOn": { en: "Deployed on", fr: "Déployé le" },

  // Settings page
  "settings.title": { en: "Settings", fr: "Paramètres" },
  "settings.appearance": { en: "Appearance", fr: "Apparence" },
  "settings.light": { en: "Light", fr: "Clair" },
  "settings.dark": { en: "Dark", fr: "Sombre" },
  "settings.system": { en: "System", fr: "Système" },
  "settings.language": { en: "Language", fr: "Langue" },
  "settings.apiConfig": { en: "API Configuration", fr: "Configuration API" },
  "settings.clientId": { en: "Client ID", fr: "Identifiant Client" },
  "settings.apiKey": { en: "API Key", fr: "Clé API" },
  "settings.save": { en: "Save Configuration", fr: "Sauvegarder" },
  "settings.saved": { en: "Saved!", fr: "Sauvegardé !" },
  "settings.signOut": { en: "Sign Out", fr: "Déconnexion" },
  "settings.signOutDesc": {
    en: "This will clear your credentials and return to the login page.",
    fr: "Cela effacera vos identifiants et vous ramènera à la page de connexion.",
  },
  "settings.about": { en: "About", fr: "À propos" },
  "settings.aboutDesc": {
    en: "YARDA v1.0.0 \u2014 Real-time fraud monitoring and analytics platform for MTO clients. Powered by machine learning with hybrid scoring (rules + anomaly detection + ML).",
    fr: "YARDA v1.0.0 \u2014 Plateforme de surveillance et d'analyse de fraude en temps réel pour les clients MTO. Propulsée par l'apprentissage automatique avec scoring hybride (règles + détection d'anomalies + ML).",
  },

  // Pagination
  "pagination.results": { en: "results", fr: "résultats" },
  "pagination.result": { en: "result", fr: "résultat" },

  // Decision legend labels
  "legend.allowed": { en: "Allowed", fr: "Autorisées" },
  "legend.review": { en: "Review", fr: "Révision" },
  "legend.alert": { en: "Alert", fr: "Alerte" },
  "legend.blocked": { en: "Blocked", fr: "Bloquées" },

  // Phase progress (kept for backward compat, primary keys above)
  "phase.progressTitle": { en: "Phase Progression", fr: "Progression de Phase" },
  "phase.currentPhase": { en: "Current Phase", fr: "Phase Actuelle" },
  "phase.nextPhase": { en: "Next Phase", fr: "Phase Suivante" },
  "phase.labelsCollected": { en: "Labels Collected", fr: "Labels Collectés" },
  "phase.labelsRemaining": { en: "labels remaining", fr: "labels restants" },
  "phase.labelsNeeded": { en: "labels needed", fr: "labels nécessaires" },
  "phase.reachedFinal": {
    en: "Final phase reached",
    fr: "Phase finale atteinte",
  },

  // Scoring
  "scoring.title": { en: "Scoring Formula", fr: "Formule de Scoring" },
  "scoring.anomalyDetector": { en: "Anomaly Detector", fr: "Détecteur d'Anomalies" },
  "scoring.fraudDetector": { en: "Fraud Detector", fr: "Détecteur de Fraude" },
  "scoring.rules": { en: "Rules Engine", fr: "Moteur de Règles" },
  "scoring.plus": { en: "plus", fr: "plus" },
  "scoring.anomalyShort": { en: "anomaly", fr: "anomalie" },
  "scoring.classifierShort": { en: "classifier", fr: "classifieur" },
  "scoring.networkShort": { en: "network", fr: "réseau" },

  // Review / Labeling
  "review.labelTransaction": { en: "Label Transaction", fr: "Étiqueter la Transaction" },
  "review.markFraud": { en: "Fraud", fr: "Fraude" },
  "review.markLegitimate": { en: "Legitimate", fr: "Légitime" },
  "review.fraudType": { en: "Fraud Type", fr: "Type de Fraude" },
  "review.selectFraudType": { en: "Select fraud type", fr: "Sélectionner le type de fraude" },
  "review.notes": { en: "Notes", fr: "Notes" },
  "review.submitLabel": { en: "Submit Label", fr: "Soumettre le Label" },
  "review.submitting": { en: "Submitting...", fr: "Envoi..." },
  "review.labelSubmitted": { en: "Label submitted!", fr: "Label soumis !" },
  "review.detectionBanner": {
    en: "Detection Phase: Label transactions to train the first fraud classification model",
    fr: "Phase de Détection : Étiquetez les transactions pour entraîner le premier modèle de classification de fraude",
  },
  "review.collectLabels": {
    en: "Collect labels to improve detection",
    fr: "Collectez des labels pour améliorer la détection",
  },

  // Fraud types taxonomy
  "fraudType.account_takeover": { en: "Account Takeover", fr: "Prise de Contrôle de Compte" },
  "fraudType.mule_account": { en: "Mule Account", fr: "Compte Mule" },
  "fraudType.identity_theft": { en: "Identity Theft", fr: "Usurpation d'Identité" },
  "fraudType.money_laundering": { en: "Money Laundering", fr: "Blanchiment d'Argent" },
  "fraudType.structuring": { en: "Structuring / Smurfing", fr: "Fractionnement / Schtroumpfage" },
  "fraudType.social_engineering": { en: "Social Engineering", fr: "Ingénierie Sociale" },
  "fraudType.synthetic_identity": { en: "Synthetic Identity", fr: "Identité Synthétique" },
  "fraudType.unauthorized_transfer": {
    en: "Unauthorized Transfer",
    fr: "Transfert Non Autorisé",
  },
  "fraudType.other": { en: "Other", fr: "Autre" },

  // Scoring configuration section
  "config.title": { en: "Scoring Configuration", fr: "Configuration du Scoring" },
  "config.decisionThresholds": { en: "Decision Thresholds", fr: "Seuils de Décision" },
  "config.fraudTaxonomy": { en: "Fraud Taxonomy", fr: "Taxonomie de Fraude" },
  "config.weightsByPhase": { en: "Scoring Weights by Phase", fr: "Pondérations par Phase" },
  "config.threshold.allow": {
    en: "Normal — below review threshold",
    fr: "Normal — en dessous du seuil de révision",
  },
  "config.threshold.review": {
    en: "Review — flagged for human review",
    fr: "Révision — signalé pour révision humaine",
  },
  "config.threshold.alert": {
    en: "Alert — high risk, immediate attention",
    fr: "Alerte — risque élevé, attention immédiate",
  },
  "config.threshold.block": {
    en: "Block — transaction blocked automatically",
    fr: "Blocage — transaction bloquée automatiquement",
  },
  "config.anomalyDetector": {
    en: "Anomaly Detector",
    fr: "Détecteur d'Anomalies",
  },
  "config.fraudClassifier": {
    en: "Fraud Classifier",
    fr: "Classifieur de Fraude",
  },
  "config.networkDetector": {
    en: "Network Detector (GNN)",
    fr: "Détecteur de Réseaux (GNN)",
  },

  // Impact metrics (dashboard)
  "impact.title": { en: "Impact", fr: "Impact" },
  "impact.confirmedFraud": {
    en: "Confirmed Fraud Intercepted",
    fr: "Fraude Confirmée Interceptée",
  },
  "impact.underSurveillance": { en: "Under Surveillance", fr: "Sous Surveillance" },
  "impact.totalProcessed": { en: "Total Processed", fr: "Total Traité" },
  "impact.transactions": { en: "transactions", fr: "transactions" },

  // System / Admin page
  "nav.system": { en: "System", fr: "Système" },
  "system.title": { en: "System", fr: "Système" },
  "system.health": { en: "System Health", fr: "Santé Système" },
  "system.healthy": { en: "Healthy", fr: "Sain" },
  "system.degraded": { en: "Degraded", fr: "Dégradé" },
  "system.uptime": { en: "Uptime", fr: "Temps d'activité" },
  "system.database": { en: "Database", fr: "Base de données" },
  "system.redis": { en: "Redis", fr: "Redis" },
  "system.activeClients": { en: "Active Clients", fr: "Clients Actifs" },
  "system.prodModels": { en: "Production Models", fr: "Modèles en Production" },
  "system.ingestion": { en: "Ingestion & API", fr: "Ingestion & API" },
  "system.totalRequests": { en: "Total Requests", fr: "Requêtes Totales" },
  "system.errorRate": { en: "Error Rate", fr: "Taux d'Erreur" },
  "system.avgLatency": { en: "Avg Latency", fr: "Latence Moy." },
  "system.p95Latency": { en: "P95 Latency", fr: "Latence P95" },
  "system.p99Latency": { en: "P99 Latency", fr: "Latence P99" },
  "system.topEndpoints": { en: "Top Endpoints", fr: "Points d'Accès Principaux" },
  "system.impact": { en: "Impact Metrics", fr: "Métriques d'Impact" },
  "system.confirmedFraud": {
    en: "Confirmed Fraud Intercepted",
    fr: "Fraude Confirmée Interceptée",
  },
  "system.underSurveillance": { en: "Amount Under Surveillance", fr: "Montant Sous Surveillance" },
  "system.totalProcessed": { en: "Total Processed", fr: "Total Traité" },
  "system.transactions": { en: "transactions", fr: "transactions" },
  "system.clients": { en: "Client Phases", fr: "Phases Clients" },
  "system.models": { en: "Model Registry", fr: "Registre de Modèles" },
  "system.activeModel": { en: "Active Model", fr: "Modèle Actif" },
  "system.noActiveModel": { en: "No active model", fr: "Aucun modèle actif" },
  "system.retraining": { en: "Retraining", fr: "Réentraînement" },
  "system.triggers": { en: "Triggers", fr: "Déclencheurs" },
  "system.enabled": { en: "Enabled", fr: "Activé" },
  "system.disabled": { en: "Disabled", fr: "Désactivé" },
  "system.minImprovement": { en: "Min Improvement", fr: "Amélioration Min." },
  "system.primaryMetric": { en: "Primary Metric", fr: "Métrique Principale" },
  "system.feedback": { en: "Feedback & Labels", fr: "Retours & Labels" },
  "system.totalLabeled": { en: "Total Labeled", fr: "Total Étiquetés" },
  "system.fraudLabels": { en: "Fraud Labels", fr: "Labels Fraude" },
  "system.legitLabels": { en: "Legitimate Labels", fr: "Labels Légitimes" },
  "system.experiments": { en: "Experiment Tracking", fr: "Suivi d'Expériences" },
  "system.workspace": { en: "Workspace", fr: "Espace de Travail" },
  "system.project": { en: "Project", fr: "Projet" },
  "system.noExperiments": {
    en: "No experiments found or Comet ML not configured",
    fr: "Aucune expérience trouvée ou Comet ML non configuré",
  },
  "system.reports": { en: "Training Reports", fr: "Rapports d'Entraînement" },
  "system.noReports": { en: "No reports available", fr: "Aucun rapport disponible" },
  "system.features": { en: "Feature Pipeline", fr: "Pipeline de Features" },
  "system.allClients": { en: "All Clients", fr: "Tous les Clients" },
  "system.filterByClient": { en: "Filter by client", fr: "Filtrer par client" },
  "system.selectClient": { en: "Select client...", fr: "Sélectionner un client..." },
  "system.checkRetraining": { en: "Check", fr: "Vérifier" },
  "system.shouldRetrain": { en: "Retraining recommended", fr: "Réentraînement recommandé" },
  "system.noRetrain": { en: "No retraining needed", fr: "Pas de réentraînement nécessaire" },
  "system.anomaly": { en: "Anomaly Detector", fr: "Détecteur d'Anomalies" },
  "system.fitted": { en: "Fitted", fr: "Entraîné" },
  "system.notFitted": { en: "Not fitted", fr: "Non entraîné" },
  "system.users": { en: "User Management", fr: "Gestion des Utilisateurs" },
  "system.addUser": { en: "Add User", fr: "Ajouter un Utilisateur" },
  "system.userEmail": { en: "Email", fr: "Email" },
  "system.userPassword": { en: "Password", fr: "Mot de passe" },
  "system.userName": { en: "Display Name", fr: "Nom d'affichage" },
  "system.userRole": { en: "Role", fr: "Rôle" },
  "system.userClient": { en: "Client", fr: "Client" },
  "system.userCreated": { en: "User created successfully", fr: "Utilisateur créé avec succès" },
  "system.noClient": { en: "None (Admin)", fr: "Aucun (Admin)" },
  "system.unauthorized": {
    en: "Unauthorized — Admin access required",
    fr: "Non autorisé — Accès admin requis",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? key;
}
