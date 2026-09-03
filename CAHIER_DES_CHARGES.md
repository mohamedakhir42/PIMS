================================================================================
        CAHIER DES CHARGES
        SYSTÈME DE GESTION D'INVENTAIRE
        PHOSBOUCRAA
================================================================================

Version : 1.0
Type : Application Web de gestion d'inventaire
Statut : Spécification fonctionnelle
Périmètre : Gestion des articles, stocks, mouvements, fournisseurs,
            utilisateurs, demandes, inventaires et reporting

================================================================================
1. PRÉSENTATION DU PROJET
================================================================================

1.1 NOM DU PROJET
-----------------

Nom proposé :

    PHOSBOUCRAA INVENTORY MANAGEMENT SYSTEM

Abréviation :

    PIMS

L'application est une solution web permettant de centraliser et de
digitaliser la gestion des stocks et des inventaires.

Elle doit permettre aux utilisateurs autorisés de :

    - consulter les articles ;
    - consulter les niveaux de stock ;
    - gérer les articles ;
    - gérer les catégories ;
    - gérer les fournisseurs ;
    - gérer les magasins et emplacements ;
    - enregistrer les entrées de stock ;
    - enregistrer les sorties de stock ;
    - effectuer des transferts ;
    - gérer les demandes d'articles ;
    - effectuer des inventaires physiques ;
    - consulter l'historique ;
    - recevoir des alertes ;
    - générer des rapports ;
    - exporter les données ;
    - assurer la traçabilité des opérations.

IMPORTANT :

Cette application est un système de gestion d'inventaire conçu pour un
contexte industriel inspiré du besoin exprimé pour Phosboucraa.

Elle ne doit pas être présentée comme le remplacement d'un ERP ou comme
le système officiel interne de Phosboucraa sans validation des processus
et exigences internes.


================================================================================
2. OBJECTIFS
================================================================================

2.1 OBJECTIF PRINCIPAL
----------------------

Mettre en place une application web permettant de gérer les stocks de
manière centralisée, fiable, traçable et facilement exploitable.

2.2 OBJECTIFS FONCTIONNELS
--------------------------

L'application doit permettre :

    1. La gestion des articles.
    2. La gestion des catégories.
    3. La gestion des fournisseurs.
    4. La gestion des sites.
    5. La gestion des magasins.
    6. La gestion des zones et emplacements.
    7. La gestion des stocks.
    8. La gestion des entrées.
    9. La gestion des sorties.
   10. La gestion des transferts.
   11. La gestion des demandes.
   12. La validation des demandes.
   13. La gestion des inventaires physiques.
   14. La génération d'alertes.
   15. La consultation de l'historique.
   16. La traçabilité des opérations.
   17. La gestion des utilisateurs.
   18. La gestion des rôles et permissions.
   19. La génération de rapports.
   20. L'export PDF et Excel.
   21. La visualisation des indicateurs dans un dashboard.


================================================================================
3. UTILISATEURS DU SYSTÈME
================================================================================

L'application possède plusieurs profils.

3.1 SUPER ADMINISTRATEUR
------------------------

Le Super Admin possède les droits les plus élevés.

Permissions :

    - créer un utilisateur ;
    - modifier un utilisateur ;
    - désactiver un utilisateur ;
    - réactiver un utilisateur ;
    - attribuer un rôle ;
    - gérer les permissions ;
    - gérer les sites ;
    - gérer les magasins ;
    - gérer les emplacements ;
    - gérer les catégories ;
    - consulter tous les articles ;
    - consulter tous les stocks ;
    - consulter tous les mouvements ;
    - consulter les logs ;
    - consulter les statistiques ;
    - configurer certains paramètres du système.

Le Super Admin ne doit pas pouvoir supprimer physiquement les
informations critiques d'historique.

Les opérations sensibles doivent être conservées dans les logs.


3.2 GESTIONNAIRE DE STOCK
-------------------------

Le gestionnaire de stock est responsable de la supervision du stock.

Permissions :

    - consulter les stocks ;
    - créer des articles ;
    - modifier des articles ;
    - gérer les catégories ;
    - gérer les fournisseurs ;
    - enregistrer des réceptions ;
    - enregistrer des sorties ;
    - effectuer des transferts ;
    - consulter les demandes ;
    - valider certaines opérations selon ses permissions ;
    - effectuer des inventaires ;
    - consulter les alertes ;
    - générer des rapports ;
    - exporter les données.


3.3 MAGASINIER
--------------

Le magasinier travaille directement avec les stocks physiques.

Permissions principales :

    - rechercher un article ;
    - consulter le stock ;
    - enregistrer une réception ;
    - enregistrer une sortie ;
    - préparer une sortie ;
    - effectuer un transfert ;
    - confirmer une réception ;
    - participer à un inventaire ;
    - consulter l'historique nécessaire à son travail.

Le magasinier ne peut pas :

    - gérer les utilisateurs ;
    - modifier les permissions ;
    - supprimer des données critiques ;
    - modifier les paramètres globaux.


3.4 DEMANDEUR
-------------

Le demandeur peut demander des articles.

Exemple :

    Service : Maintenance
    Article : Roulement SKF 6205
    Quantité : 4
    Motif : Maintenance préventive
    Priorité : Normale

Le demandeur peut :

    - créer une demande ;
    - consulter ses demandes ;
    - voir le statut d'une demande ;
    - annuler une demande encore en attente ;
    - consulter l'historique de ses demandes.


3.5 RESPONSABLE / MANAGER
-------------------------

Le responsable est chargé de valider ou refuser certaines demandes.

Il peut :

    - consulter les demandes de son périmètre ;
    - approuver une demande ;
    - refuser une demande ;
    - demander une modification ;
    - consulter l'historique ;
    - consulter les stocks.


3.6 AUDITEUR / CONSULTATION
---------------------------

Profil principalement en lecture.

Il peut :

    - consulter les articles ;
    - consulter les stocks ;
    - consulter les mouvements ;
    - consulter les inventaires ;
    - consulter les rapports ;
    - consulter les logs d'audit.

Il ne peut pas :

    - modifier les stocks ;
    - créer une sortie ;
    - créer une entrée ;
    - supprimer des données ;
    - modifier les utilisateurs.


================================================================================
4. AUTHENTIFICATION
================================================================================

4.1 CONNEXION
-------------

L'utilisateur se connecte avec :

    - identifiant ou email ;
    - mot de passe.

Après authentification :

    Login
      |
      v
    Vérification des identifiants
      |
      v
    Génération du token
      |
      v
    Chargement du profil
      |
      v
    Dashboard


4.2 AUTHENTIFICATION JWT
------------------------

Le backend utilise JWT.

Le frontend transmet le token dans les requêtes protégées.

Exemple conceptuel :

    Authorization: Bearer <TOKEN>


4.3 DÉCONNEXION
---------------

Lorsqu'un utilisateur se déconnecte :

    - la session locale est supprimée ;
    - le token est supprimé ;
    - l'utilisateur est redirigé vers /login.


4.4 PROTECTION DES ROUTES
-------------------------

Les pages doivent être protégées selon les permissions.

Exemple :

    /users
        -> ADMIN uniquement

    /inventory
        -> utilisateurs autorisés

    /reports
        -> utilisateurs autorisés

    /audit-logs
        -> ADMIN / AUDITEUR


================================================================================
5. ORGANISATION PHYSIQUE
================================================================================

Le système doit pouvoir représenter l'organisation physique du stock.

Structure :

    ORGANISATION
        |
        +---- SITE
                |
                +---- MAGASIN
                        |
                        +---- ZONE
                                |
                                +---- EMPLACEMENT


5.1 SITE
--------

Exemple :

    Site Boucraa
    Site Laâyoune

Chaque site possède :

    - nom ;
    - code ;
    - description ;
    - adresse ;
    - statut.


5.2 MAGASIN
-----------

Chaque magasin appartient à un site.

Informations :

    - nom ;
    - code ;
    - site ;
    - responsable ;
    - description ;
    - statut.


5.3 ZONE
--------

Un magasin peut être divisé en zones.

Exemple :

    MAGASIN M01

        Zone A
        Zone B
        Zone C


5.4 EMPLACEMENT
---------------

Chaque zone peut contenir plusieurs emplacements.

Exemple :

    M01
      |
      +-- A
          |
          +-- A01
          +-- A02
          +-- A03

Un emplacement possède :

    - code ;
    - nom ;
    - zone ;
    - magasin ;
    - capacité éventuelle ;
    - statut.


================================================================================
6. GESTION DES ARTICLES
================================================================================

6.1 CRÉATION D'UN ARTICLE
-------------------------

Un article possède au minimum :

    ID
    Code article
    Référence
    Désignation
    Description
    Catégorie
    Unité de mesure
    Stock minimum
    Stock maximum
    Point de commande
    Fournisseur principal
    Statut


6.2 INFORMATIONS OPTIONNELLES
-----------------------------

Selon le type d'article :

    - marque ;
    - modèle ;
    - référence fabricant ;
    - numéro de série ;
    - numéro de lot ;
    - date de fabrication ;
    - date d'expiration ;
    - poids ;
    - dimensions ;
    - image ;
    - document technique.


6.3 STATUT ARTICLE
------------------

Un article peut avoir :

    ACTIVE
    INACTIVE
    DISCONTINUED


6.4 RÈGLE IMPORTANTE
--------------------

La suppression physique d'un article ayant un historique de mouvement
doit être interdite.

À la place :

    article.status = INACTIVE


================================================================================
7. CATÉGORIES
================================================================================

Les articles sont classés par catégories.

Exemple de classification proposée :

    Équipements industriels
        |
        +-- Mécanique
        |      +-- Roulements
        |      +-- Courroies
        |      +-- Joints
        |
        +-- Électrique
        |      +-- Câbles
        |      +-- Fusibles
        |      +-- Capteurs
        |
        +-- Hydraulique
        |
        +-- Pneumatique
        |
        +-- EPI
        |
        +-- Outillage
        |
        +-- Consommables

Cette classification est une proposition de conception et doit être
adaptée à la nomenclature réelle si celle-ci est fournie.


================================================================================
8. GESTION DES FOURNISSEURS
================================================================================

Chaque fournisseur possède :

    ID
    Nom
    Code fournisseur
    ICE / identifiant si nécessaire
    Adresse
    Téléphone
    Email
    Contact principal
    Statut
    Date de création


8.1 RELATION FOURNISSEUR / ARTICLE
----------------------------------

Un fournisseur peut fournir plusieurs articles.

Un article peut avoir plusieurs fournisseurs.

Relation :

    ARTICLE N <----> N FOURNISSEUR


8.2 HISTORIQUE FOURNISSEUR
--------------------------

Le système doit pouvoir afficher :

    - articles fournis ;
    - dernières réceptions ;
    - quantités reçues ;
    - historique des opérations associées.


================================================================================
9. GESTION DU STOCK
================================================================================

Le stock représente la quantité réellement disponible.

Exemple :

    Article :
        Roulement SKF 6205

    Site :
        Boucraa

    Magasin :
        M01

    Emplacement :
        A03

    Quantité :
        42


9.1 STOCK PAR EMPLACEMENT
-------------------------

Un même article peut être présent dans plusieurs emplacements.

Exemple :

    Roulement SKF 6205

    Boucraa / M01 / A03
        18 unités

    Laâyoune / M03 / B02
        24 unités

    TOTAL
        42 unités


9.2 STOCK DISPONIBLE
--------------------

Le stock disponible doit être calculable à partir des mouvements
validés.

Règle conceptuelle :

    STOCK = ENTRÉES - SORTIES + AJUSTEMENTS


9.3 NE PAS MODIFIER DIRECTEMENT LE STOCK
-----------------------------------------

Une opération de stock doit toujours générer un mouvement.

Éviter :

    stock.quantity = stock.quantity + 100

sans historique.

Préférer :

    CREATE MOVEMENT
        type = RECEIPT
        quantity = 100

puis recalculer / mettre à jour le stock.


================================================================================
10. MOUVEMENTS DE STOCK
================================================================================

Types de mouvements :

    RECEIPT
    ISSUE
    TRANSFER
    RETURN
    ADJUSTMENT
    INVENTORY_ADJUSTMENT


Chaque mouvement possède :

    ID
    Numéro du mouvement
    Article
    Quantité
    Type
    Utilisateur
    Date
    Site
    Magasin
    Emplacement
    Motif
    Référence éventuelle
    Commentaire


10.1 RÉCEPTION
--------------

Exemple :

    Fournisseur :
        Fournisseur ABC

    Bon de livraison :
        BL-2026-00124

    Article :
        Roulement SKF 6205

    Quantité :
        100

    Destination :
        M01 / A03


Processus :

    Livraison
       |
       v
    Création réception
       |
       v
    Vérification
       |
       v
    Confirmation
       |
       v
    Mouvement RECEIPT
       |
       v
    Stock +100


10.2 SORTIE
-----------

Exemple :

    Article :
        Roulement SKF 6205

    Quantité :
        4

    Destination :
        Maintenance

    Motif :
        Maintenance préventive


Processus :

    Demande
       |
       v
    Validation
       |
       v
    Préparation
       |
       v
    Sortie
       |
       v
    Stock -4


10.3 TRANSFERT
--------------

Exemple :

    Source :
        Boucraa / M01 / A03

    Destination :
        Laâyoune / M03 / B02

    Quantité :
        50


États :

    REQUESTED
    APPROVED
    IN_TRANSIT
    RECEIVED
    CANCELLED


Un transfert ne doit pas être considéré comme terminé avant confirmation
de la réception lorsque le workflow prévoit une réception.


10.4 RETOUR
-----------

Permet de remettre en stock un article précédemment sorti.

Exemple :

    Sortie :
        10 unités

    Retour :
        3 unités

    Stock :
        +3


10.5 AJUSTEMENT
---------------

Utilisé lorsqu'une différence est constatée.

Exemple :

    Stock système :
        20

    Stock physique :
        18

    Écart :
        -2

Le système crée :

    ADJUSTMENT
        quantity = -2

avec :

    - utilisateur ;
    - motif ;
    - date ;
    - inventaire associé.


================================================================================
11. DEMANDES D'ARTICLES
================================================================================

Le demandeur ne modifie pas directement le stock.

Il crée une demande.

Structure :

    DEMANDE
        |
        +-- Demandeur
        +-- Service
        +-- Date
        +-- Priorité
        +-- Motif
        +-- Statut
        |
        +-- Lignes
               |
               +-- Article
               +-- Quantité


11.1 STATUTS
------------

    DRAFT
    SUBMITTED
    PENDING_APPROVAL
    APPROVED
    REJECTED
    PREPARING
    READY
    ISSUED
    CANCELLED


11.2 WORKFLOW
-------------

    DEMANDEUR
        |
        v
    Création
        |
        v
    SUBMITTED
        |
        v
    PENDING_APPROVAL
        |
        +-------> REJECTED
        |
        v
    APPROVED
        |
        v
    PREPARING
        |
        v
    READY
        |
        v
    ISSUED


11.3 REFUS
----------

Lorsqu'une demande est refusée :

    - elle passe à REJECTED ;
    - le responsable doit fournir un motif ;
    - le demandeur peut consulter le motif.


================================================================================
12. ALERTES
================================================================================

Le système doit détecter les situations importantes.

12.1 STOCK CRITIQUE
-------------------

Si :

    stock <= 0

alors :

    CRITICAL


12.2 STOCK FAIBLE
-----------------

Si :

    stock < stock_minimum

alors :

    LOW_STOCK


12.3 STOCK NORMAL
-----------------

Si :

    stock >= stock_minimum

alors :

    NORMAL


12.4 ALERTE DE RÉAPPROVISIONNEMENT
-----------------------------------

Si le stock atteint le point de commande :

    REORDER_REQUIRED


12.5 NOTIFICATIONS
------------------

Les notifications peuvent apparaître :

    - dans le dashboard ;
    - dans une cloche de notification ;
    - dans une page /notifications.


================================================================================
13. INVENTAIRE PHYSIQUE
================================================================================

Le système doit permettre d'effectuer un inventaire physique.

13.1 CRÉATION
-------------

Créer :

    Inventaire #INV-2026-001

    Site :
        Boucraa

    Magasin :
        M01

    Responsable :
        Utilisateur

    Date :
        Date actuelle


13.2 LISTE DES ARTICLES
-----------------------

Le système récupère les articles théoriquement présents.

Exemple :

    Article          Théorique    Physique    Écart

    Article A           20           20         0
    Article B           15           13        -2
    Article C           50           53        +3


13.3 VALIDATION
---------------

Après validation :

    - les écarts sont enregistrés ;
    - les ajustements nécessaires sont créés ;
    - l'inventaire devient clôturé ;
    - l'historique est conservé.


13.4 IMMUTABILITÉ
-----------------

Un inventaire clôturé ne doit pas être modifié librement.

Toute correction doit passer par une opération traçable.


================================================================================
14. RECHERCHE
================================================================================

Une recherche globale doit permettre de rechercher :

    - code article ;
    - référence ;
    - désignation ;
    - catégorie ;
    - fournisseur ;
    - emplacement.


Exemple :

    Recherche :
        6205

Résultat :

    SKF 6205

    Stock total : 42

    Boucraa / M01 / A03
        18

    Laâyoune / M03 / B02
        24


================================================================================
15. FILTRES
================================================================================

Les listes doivent proposer des filtres.

Exemple Articles :

    Catégorie
    Fournisseur
    Site
    Magasin
    Statut
    Stock faible


Exemple Mouvements :

    Type
    Article
    Utilisateur
    Site
    Magasin
    Date début
    Date fin


Exemple Demandes :

    Statut
    Demandeur
    Service
    Priorité
    Date


================================================================================
16. DASHBOARD
================================================================================

Le dashboard est la page principale après connexion.

16.1 INDICATEURS
----------------

Afficher :

    Nombre total d'articles
    Nombre total d'unités en stock
    Nombre de stocks critiques
    Nombre de stocks faibles
    Nombre de mouvements
    Nombre de demandes en attente
    Nombre d'inventaires en cours


16.2 GRAPHIQUES
---------------

Graphique :

    Évolution des entrées

Graphique :

    Évolution des sorties

Graphique :

    Mouvements par type

Graphique :

    Articles par catégorie

Graphique :

    Stock par magasin


16.3 ALERTES
------------

Afficher les articles critiques :

    ⚠ Roulement SKF 6205
      Stock : 3
      Minimum : 10


16.4 ACTIVITÉ RÉCENTE
---------------------

Exemple :

    10:42 Ahmed
         Sortie
         Roulement SKF 6205 x4

    10:21 Youssef
         Réception
         Filtre x50

    09:54 Karim
         Transfert
         Câble x20


================================================================================
17. HISTORIQUE
================================================================================

Chaque opération importante doit être historisée.

Exemple :

    03/09/2026 10:42
    Ahmed
    ISSUE
    Roulement SKF 6205
    Quantité : 4


17.1 HISTORIQUE ARTICLE
-----------------------

Depuis la page d'un article :

    Informations
    Stock actuel
    Emplacements
    Fournisseurs
    Historique

Exemple :

    Date        Type       Quantité     User

    03/09       ISSUE         -4        Ahmed
    02/09       RECEIPT      +50        Youssef
    01/09       TRANSFER     -20        Karim


================================================================================
18. AUDIT LOG
================================================================================

Le système doit conserver un journal des actions sensibles.

Exemples :

    USER_LOGIN
    USER_LOGOUT
    CREATE_ARTICLE
    UPDATE_ARTICLE
    CREATE_SUPPLIER
    CREATE_RECEIPT
    CREATE_ISSUE
    CREATE_TRANSFER
    APPROVE_REQUEST
    REJECT_REQUEST
    CREATE_INVENTORY
    VALIDATE_INVENTORY
    UPDATE_USER
    CHANGE_PERMISSION


Chaque log contient :

    ID
    Utilisateur
    Action
    Entité
    Entity ID
    Date
    Anciennes valeurs si nécessaire
    Nouvelles valeurs si nécessaire
    Adresse IP si autorisée
    Informations complémentaires


IMPORTANT :

Les mouvements de stock et logs d'audit ne doivent pas être supprimés
physiquement de manière normale.


================================================================================
19. QR CODE / CODE-BARRES
================================================================================

FONCTIONNALITÉ OPTIONNELLE MAIS RECOMMANDÉE.

Chaque article peut posséder un identifiant scannable.

Exemple :

    QR
      |
      v
    Article
      |
      +-- Désignation
      +-- Code
      +-- Stock
      +-- Emplacement


Le QR code d'un emplacement peut également être utilisé.

Exemple :

    Scanner :
        M01-A03

    Résultat :

        MAGASIN M01
        EMPLACEMENT A03

        Articles :
            Roulement 6205 x18
            Filtre X x10
            Courroie Y x5


================================================================================
20. DOCUMENTS ET PIÈCES JOINTES
================================================================================

Une opération peut être associée à un document.

Exemples :

    Bon de livraison
    Facture
    Document technique
    Certificat
    Document fournisseur


Une réception peut donc contenir :

    Reception
        |
        +-- BL.pdf
        +-- Facture.pdf
        +-- Certificat.pdf


================================================================================
21. RAPPORTS
================================================================================

Le système doit proposer une page :

    /reports


Rapports possibles :

    1. État général du stock.
    2. Stock par magasin.
    3. Stock par catégorie.
    4. Articles critiques.
    5. Mouvements par période.
    6. Entrées.
    7. Sorties.
    8. Transferts.
    9. Historique d'un article.
   10. Historique d'un fournisseur.
   11. Inventaires.
   12. Écarts d'inventaire.
   13. Activité des utilisateurs.


================================================================================
22. EXPORTS
================================================================================

Le système doit permettre l'exportation :

    PDF
    Excel


Filtres appliqués avant export.

Exemple :

    Rapport stock
    Site : Boucraa
    Magasin : M01
    Date : 01/09/2026 -> 03/09/2026

    [ Export PDF ]
    [ Export Excel ]


================================================================================
23. NOTIFICATIONS
================================================================================

Les notifications peuvent concerner :

    - stock critique ;
    - nouvelle demande ;
    - demande approuvée ;
    - demande refusée ;
    - transfert reçu ;
    - inventaire terminé ;
    - anomalie.


Exemple :

    🔔 Nouvelle demande

    Ahmed a demandé :

    Roulement SKF 6205 x4

    [ Voir la demande ]


================================================================================
24. RÔLES ET PERMISSIONS
================================================================================

Le système doit utiliser un système RBAC :

    Role Based Access Control


Structure :

    USER
      |
      v
    ROLE
      |
      v
    PERMISSIONS


Permissions proposées :

    USERS_READ
    USERS_CREATE
    USERS_UPDATE
    USERS_DISABLE

    ARTICLES_READ
    ARTICLES_CREATE
    ARTICLES_UPDATE
    ARTICLES_DISABLE

    CATEGORIES_READ
    CATEGORIES_CREATE
    CATEGORIES_UPDATE

    SUPPLIERS_READ
    SUPPLIERS_CREATE
    SUPPLIERS_UPDATE

    STOCK_READ
    STOCK_RECEIVE
    STOCK_ISSUE
    STOCK_TRANSFER
    STOCK_ADJUST

    REQUEST_CREATE
    REQUEST_READ
    REQUEST_APPROVE
    REQUEST_REJECT

    INVENTORY_CREATE
    INVENTORY_READ
    INVENTORY_VALIDATE

    REPORT_READ
    REPORT_EXPORT

    AUDIT_READ


================================================================================
25. STRUCTURE DE LA BASE DE DONNÉES
================================================================================

Tables principales :

    users
    roles
    permissions
    role_permissions

    sites
    warehouses
    zones
    locations

    categories
    articles
    suppliers
    article_suppliers

    stock
    stock_movements

    stock_requests
    stock_request_items

    inventories
    inventory_items

    notifications
    attachments

    audit_logs


================================================================================
26. RELATIONS PRINCIPALES
================================================================================

USER
 |
 +---- ROLE
 |
 +---- REQUESTS
 |
 +---- MOVEMENTS
 |
 +---- AUDIT_LOGS
 |
 +---- INVENTORIES


SITE
 |
 +---- WAREHOUSES
        |
        +---- ZONES
                |
                +---- LOCATIONS
                        |
                        +---- STOCK


ARTICLE
 |
 +---- CATEGORY
 |
 +---- SUPPLIERS
 |
 +---- STOCK
 |
 +---- MOVEMENTS
 |
 +---- REQUEST_ITEMS
 |
 +---- INVENTORY_ITEMS


SUPPLIER
 |
 +---- ARTICLES


REQUEST
 |
 +---- USER
 |
 +---- REQUEST_ITEMS
 |
 +---- APPROVAL


================================================================================
27. RÈGLES MÉTIER
================================================================================

RÈGLE 01
--------

Un article ne peut pas être sorti si la quantité disponible est
insuffisante, sauf si une permission spéciale permet un stock négatif.


RÈGLE 02
--------

Chaque mouvement de stock doit être associé à un utilisateur.


RÈGLE 03
--------

Chaque mouvement doit avoir une date.


RÈGLE 04
--------

Une sortie doit indiquer un motif ou une référence de demande.


RÈGLE 05
--------

Une réception doit pouvoir être associée à un fournisseur.


RÈGLE 06
--------

Un transfert doit avoir une source et une destination.


RÈGLE 07
--------

Un article ayant un historique ne doit pas être supprimé physiquement.


RÈGLE 08
--------

Un mouvement validé ne doit pas être modifié librement.


RÈGLE 09
--------

Une correction doit créer un nouveau mouvement d'ajustement.


RÈGLE 10
--------

Une demande approuvée doit conserver l'identité du responsable ayant
effectué l'approbation.


RÈGLE 11
--------

Une demande refusée doit conserver le motif du refus.


RÈGLE 12
--------

Un inventaire clôturé ne doit plus être modifiable normalement.


RÈGLE 13
--------

Les actions sensibles doivent être enregistrées dans l'audit log.


RÈGLE 14
--------

Les quantités de stock doivent être cohérentes avec les mouvements.


RÈGLE 15
--------

Les utilisateurs ne doivent accéder qu'aux ressources correspondant
à leurs permissions et éventuellement à leur périmètre.


================================================================================
28. FRONTEND
================================================================================

Technologies proposées :

    React
    TypeScript
    Tailwind CSS
    React Router
    TanStack Query
    Recharts ou Chart.js


28.1 PAGES
----------

/login

/dashboard

/inventory

/inventory/articles
/inventory/articles/:id

/categories

/suppliers
/suppliers/:id

/sites
/warehouses
/locations

/movements
/movements/receipts
/movements/issues
/movements/transfers

/requests
/requests/:id

/inventories
/inventories/:id

/alerts

/reports

/users

/roles

/audit-logs

/settings


================================================================================
29. STRUCTURE DE NAVIGATION
================================================================================

Sidebar :

    PHOSBOUCRAA
    Inventory

    Dashboard

    INVENTAIRE
        Articles
        Stock
        Catégories
        Emplacements

    MOUVEMENTS
        Entrées
        Sorties
        Transferts

    DEMANDES

    FOURNISSEURS

    INVENTAIRES

    ALERTES

    RAPPORTS

    ADMINISTRATION
        Utilisateurs
        Rôles
        Permissions
        Audit Logs

    Paramètres


================================================================================
30. BACKEND
================================================================================

Technologie proposée :

    FastAPI

Base de données :

    PostgreSQL

ORM :

    SQLAlchemy

Validation :

    Pydantic

Authentification :

    JWT


================================================================================
31. API REST
================================================================================

AUTH

    POST /api/v1/auth/login
    POST /api/v1/auth/logout
    GET  /api/v1/auth/me


USERS

    GET    /api/v1/users
    GET    /api/v1/users/{id}
    POST   /api/v1/users
    PATCH  /api/v1/users/{id}
    DELETE /api/v1/users/{id}


ARTICLES

    GET    /api/v1/articles
    GET    /api/v1/articles/{id}
    POST   /api/v1/articles
    PATCH  /api/v1/articles/{id}
    DELETE /api/v1/articles/{id}


CATEGORIES

    GET    /api/v1/categories
    POST   /api/v1/categories
    PATCH  /api/v1/categories/{id}


SUPPLIERS

    GET    /api/v1/suppliers
    GET    /api/v1/suppliers/{id}
    POST   /api/v1/suppliers
    PATCH  /api/v1/suppliers/{id}


STOCK

    GET /api/v1/stock
    GET /api/v1/stock/{article_id}
    GET /api/v1/stock/critical


MOVEMENTS

    GET  /api/v1/movements
    POST /api/v1/movements/receipt
    POST /api/v1/movements/issue
    POST /api/v1/movements/transfer
    POST /api/v1/movements/return
    POST /api/v1/movements/adjustment


REQUESTS

    GET   /api/v1/requests
    GET   /api/v1/requests/{id}
    POST  /api/v1/requests
    PATCH /api/v1/requests/{id}
    POST  /api/v1/requests/{id}/approve
    POST  /api/v1/requests/{id}/reject


INVENTORIES

    GET  /api/v1/inventories
    GET  /api/v1/inventories/{id}
    POST /api/v1/inventories
    POST /api/v1/inventories/{id}/validate


REPORTS

    GET /api/v1/reports/stock
    GET /api/v1/reports/movements
    GET /api/v1/reports/critical-stock
    GET /api/v1/reports/inventory


================================================================================
32. ARCHITECTURE TECHNIQUE
================================================================================

Architecture générale :

                    USER
                     |
                     v
               React Frontend
                     |
                     | HTTPS / REST
                     v
                FastAPI API
                     |
        +------------+-------------+
        |            |             |
        v            v             v
   PostgreSQL     Storage      Notification
   Database       Documents      System


================================================================================
33. SÉCURITÉ
================================================================================

Le système doit prévoir :

    - mots de passe hashés ;
    - JWT ;
    - contrôle des permissions ;
    - validation des entrées ;
    - protection des endpoints ;
    - limitation des accès ;
    - logs ;
    - contrôle des fichiers uploadés ;
    - validation des types de fichiers ;
    - limitation de taille des fichiers ;
    - HTTPS en production ;
    - variables sensibles dans des variables d'environnement.


Ne jamais stocker :

    - mots de passe en clair ;
    - clés secrètes dans Git ;
    - tokens dans le code source.


================================================================================
34. PERFORMANCE
================================================================================

Le système doit rester performant lorsque le volume de données augmente.

Prévoir :

    - pagination ;
    - recherche côté backend ;
    - filtres côté backend ;
    - index PostgreSQL ;
    - requêtes optimisées ;
    - cache éventuel ;
    - chargement paginé des historiques.


Exemple :

    GET /articles?page=1&limit=25

et non :

    charger 100 000 articles dans le navigateur.


================================================================================
35. DASHBOARD - INDICATEURS
================================================================================

Indicateurs minimum :

    TOTAL_ARTICLES
    TOTAL_STOCK
    CRITICAL_STOCK
    LOW_STOCK
    TODAY_RECEIPTS
    TODAY_ISSUES
    TODAY_TRANSFERS
    PENDING_REQUESTS
    ACTIVE_INVENTORIES


Exemple :

    ┌─────────────────────────────────────────────┐
    │                 DASHBOARD                   │
    ├──────────┬──────────┬──────────┬───────────┤
    │ Articles │ Stock    │ Critique │ Demandes  │
    │  8 421   │ 154 820  │   23     │    17     │
    └──────────┴──────────┴──────────┴───────────┘


================================================================================
36. PAGE ARTICLE
================================================================================

Lorsqu'on ouvre :

    /inventory/articles/4582

Afficher :

    Désignation
    Code
    Référence
    Catégorie
    Fournisseurs
    Stock total
    Stock minimum
    Stock maximum
    Emplacements
    Historique
    Documents


Exemple :

    ===================================================
    ROULEMENT SKF 6205
    ===================================================

    Code : ART-4582
    Catégorie : Mécanique
    Unité : pièce

    STOCK TOTAL
        42

    STOCK MINIMUM
        10

    ---------------------------------------------------
    EMPLACEMENTS

    Boucraa / M01 / A03       18
    Laâyoune / M03 / B02      24

    ---------------------------------------------------

    HISTORIQUE

    03/09  ISSUE       -4
    02/09  RECEIPT    +50
    01/09  TRANSFER   -20

    ===================================================


================================================================================
37. PAGE STOCK
================================================================================

Tableau :

    Article
    Code
    Catégorie
    Site
    Magasin
    Emplacement
    Stock
    Minimum
    Statut
    Actions


Exemple :

    Roulement 6205
    ART-4582
    Mécanique
    Boucraa
    M01
    A03
    18
    10
    NORMAL


================================================================================
38. PAGE MOUVEMENTS
================================================================================

Colonnes :

    N°
    Date
    Type
    Article
    Quantité
    Source
    Destination
    Utilisateur
    Statut


Filtres :

    Type
    Article
    Site
    Date
    Utilisateur


================================================================================
39. PAGE DEMANDES
================================================================================

Colonnes :

    N°
    Demandeur
    Service
    Date
    Priorité
    Nombre d'articles
    Statut
    Actions


Badges :

    EN ATTENTE
    APPROUVÉE
    REFUSÉE
    EN PRÉPARATION
    PRÊTE
    SERVIE


================================================================================
40. PAGE FOURNISSEURS
================================================================================

Tableau :

    Code
    Nom
    Contact
    Email
    Téléphone
    Articles
    Statut
    Actions


================================================================================
41. PAGE INVENTAIRE
================================================================================

Étapes :

    1. Créer inventaire.
    2. Sélectionner site.
    3. Sélectionner magasin.
    4. Charger les articles.
    5. Saisir les quantités physiques.
    6. Calculer les écarts.
    7. Vérifier.
    8. Valider.
    9. Générer les ajustements.
   10. Clôturer.


================================================================================
42. DESIGN UI/UX
================================================================================

L'interface doit être :

    - professionnelle ;
    - sobre ;
    - claire ;
    - orientée données ;
    - responsive ;
    - facile à utiliser ;
    - adaptée à une utilisation quotidienne.


PRINCIPES :

    - éviter les écrans surchargés ;
    - privilégier les tableaux ;
    - utiliser des filtres ;
    - utiliser des badges de statut ;
    - afficher clairement les erreurs ;
    - confirmer les opérations sensibles ;
    - afficher les informations importantes immédiatement.


Les couleurs et éléments visuels devront respecter la charte graphique
validée pour le projet et ne doivent pas être considérés comme une
reproduction officielle de la charte interne sans validation.


================================================================================
43. CONFIRMATION DES ACTIONS SENSIBLES
================================================================================

Avant une opération importante :

    "Êtes-vous sûr de vouloir effectuer cette sortie ?"

Afficher :

    Article
    Quantité
    Source
    Destination
    Utilisateur
    Motif


Puis :

    [ Annuler ]       [ Confirmer ]


================================================================================
44. GESTION DES ERREURS
================================================================================

Le frontend doit afficher des messages compréhensibles.

Exemple :

    ❌ Stock insuffisant

    Article :
    Roulement SKF 6205

    Disponible :
    3

    Demandé :
    10


Autres erreurs :

    ❌ Article introuvable
    ❌ Fournisseur introuvable
    ❌ Permission insuffisante
    ❌ Demande déjà traitée
    ❌ Inventaire déjà clôturé
    ❌ Emplacement indisponible


================================================================================
45. LOGIQUE DE STOCK
================================================================================

Exemple :

STOCK INITIAL :

    100

RÉCEPTION :

    +50

SORTIE :

    -20

TRANSFERT SORTANT :

    -10

RETOUR :

    +5

AJUSTEMENT :

    -2


STOCK FINAL :

    100 + 50 - 20 - 10 + 5 - 2

    = 123


Chaque opération est enregistrée.


================================================================================
46. CONTRAINTES D'INTÉGRITÉ
================================================================================

La base de données doit empêcher les incohérences.

Exemples :

    - quantité >= 0 lorsque le stock négatif n'est pas autorisé ;
    - article obligatoire ;
    - utilisateur obligatoire ;
    - type de mouvement obligatoire ;
    - quantité > 0 ;
    - source obligatoire pour transfert ;
    - destination obligatoire pour transfert ;
    - fournisseur obligatoire pour certaines réceptions ;
    - demande obligatoire pour certaines sorties.


================================================================================
47. SOFT DELETE
================================================================================

Pour les entités historiques :

    PAS DE DELETE PHYSIQUE


Exemple :

    Article
        ACTIVE
        INACTIVE

    Fournisseur
        ACTIVE
        INACTIVE

    Utilisateur
        ACTIVE
        DISABLED


Les données historiques restent accessibles.


================================================================================
48. TESTS
================================================================================

Le projet doit contenir plusieurs niveaux de tests.

48.1 TESTS UNITAIRES
--------------------

Tester :

    - calcul stock ;
    - validation quantité ;
    - permissions ;
    - transitions de statut ;
    - calcul des alertes.


48.2 TESTS API
--------------

Tester :

    - login ;
    - création article ;
    - création fournisseur ;
    - réception ;
    - sortie ;
    - transfert ;
    - demande ;
    - approbation ;
    - inventaire.


48.3 TESTS FRONTEND
-------------------

Tester :

    - login ;
    - navigation ;
    - formulaires ;
    - recherche ;
    - filtres ;
    - tableaux ;
    - permissions.


48.4 TESTS END-TO-END
---------------------

Scénario :

    Login
      |
      v
    Créer article
      |
      v
    Réception 100
      |
      v
    Vérifier stock
      |
      v
    Créer demande
      |
      v
    Approuver demande
      |
      v
    Sortir article
      |
      v
    Vérifier nouveau stock
      |
      v
    Vérifier historique


================================================================================
49. DÉPLOIEMENT
================================================================================

Environnement :

    DEVELOPMENT
    STAGING
    PRODUCTION


Architecture proposée :

    Docker
        |
        +-- Frontend
        |
        +-- Backend
        |
        +-- PostgreSQL


Variables :

    DATABASE_URL
    JWT_SECRET
    STORAGE_URL
    ENVIRONMENT


Les secrets ne doivent jamais être commités.


================================================================================
50. VERSIONING
================================================================================

Git doit être utilisé.

Branches proposées :

    main
    develop
    feature/*
    fix/*


Exemple :

    feature/inventory-management

    feature/stock-movements

    feature/authentication

    feature/dashboard


================================================================================
51. JOURNAL DES CHANGEMENTS
================================================================================

Le système doit permettre de comprendre :

    QUI
    A FAIT QUOI
    QUAND
    SUR QUEL OBJET


Exemple :

    Ahmed
    03/09/2026 10:42
    ISSUE
    Article ART-4582
    Quantité -4


================================================================================
52. PHASES DE DÉVELOPPEMENT
================================================================================

PHASE 1 — FONDATIONS
--------------------

    - initialisation backend ;
    - initialisation frontend ;
    - PostgreSQL ;
    - Docker ;
    - configuration environnement ;
    - migrations ;
    - authentification.


PHASE 2 — UTILISATEURS
----------------------

    - users ;
    - roles ;
    - permissions ;
    - login ;
    - protection des routes.


PHASE 3 — RÉFÉRENTIEL
---------------------

    - catégories ;
    - articles ;
    - fournisseurs ;
    - sites ;
    - magasins ;
    - zones ;
    - emplacements.


PHASE 4 — STOCK
---------------

    - stock ;
    - entrées ;
    - sorties ;
    - transferts ;
    - retours ;
    - ajustements.


PHASE 5 — DEMANDES
------------------

    - création demande ;
    - validation ;
    - refus ;
    - préparation ;
    - sortie.


PHASE 6 — INVENTAIRE
--------------------

    - sessions inventaire ;
    - comptage ;
    - écarts ;
    - ajustements ;
    - clôture.


PHASE 7 — DASHBOARD
-------------------

    - KPI ;
    - graphiques ;
    - alertes ;
    - activité récente.


PHASE 8 — RAPPORTS
------------------

    - rapports ;
    - PDF ;
    - Excel.


PHASE 9 — AUDIT
---------------

    - audit logs ;
    - historique ;
    - traçabilité.


PHASE 10 — FONCTIONNALITÉS AVANCÉES
-----------------------------------

    - QR codes ;
    - code-barres ;
    - pièces jointes ;
    - notifications avancées ;
    - prévision de stock ;
    - recommandation de réapprovisionnement.


================================================================================
53. MVP
================================================================================

La première version fonctionnelle doit obligatoirement contenir :

    AUTHENTIFICATION
        |
        +-- Login
        +-- Logout
        +-- Roles
        +-- Permissions

    ARTICLES
        |
        +-- CRUD
        +-- Recherche
        +-- Catégories

    FOURNISSEURS
        |
        +-- CRUD

    STOCK
        |
        +-- Consultation
        +-- Entrées
        +-- Sorties
        +-- Historique

    DASHBOARD
        |
        +-- KPI
        +-- Alertes
        +-- Activité récente

    RAPPORTS
        |
        +-- Stock
        +-- Mouvements
        +-- Export


================================================================================
54. VERSION 2
================================================================================

Ajouter :

    - demandes ;
    - validation ;
    - transferts ;
    - inventaires physiques ;
    - notifications ;
    - magasins multiples ;
    - emplacements.


================================================================================
55. VERSION 3
================================================================================

Ajouter :

    - QR codes ;
    - code-barres ;
    - documents ;
    - audit avancé ;
    - analytics ;
    - prévision ;
    - recommandation de réapprovisionnement.


================================================================================
56. FONCTIONNALITÉ FUTURE : STOCK INTELLIGENT
================================================================================

Le système pourra calculer :

    consommation moyenne
    délai fournisseur
    stock de sécurité
    point de commande


Exemple :

    Article :
        Roulement SKF 6205

    Stock actuel :
        18

    Consommation moyenne :
        30 / mois

    Délai fournisseur :
        15 jours

    Stock sécurité :
        5


Le système peut afficher :

    ⚠ RISQUE DE RUPTURE


Puis éventuellement :

    Quantité recommandée :
        25 unités


Cette fonctionnalité est hors MVP.


================================================================================
57. INDICATEURS DE PERFORMANCE
================================================================================

Les indicateurs futurs peuvent inclure :

    - taux de rupture ;
    - rotation des stocks ;
    - valeur du stock ;
    - nombre de mouvements ;
    - délai moyen de traitement des demandes ;
    - nombre d'ajustements ;
    - taux d'écart d'inventaire ;
    - articles dormants ;
    - consommation par période.


================================================================================
58. CRITÈRES D'ACCEPTATION
================================================================================

Le projet est considéré comme fonctionnel lorsque :

    [ ] Un utilisateur peut se connecter.
    [ ] Les permissions sont appliquées.
    [ ] Un administrateur peut créer un article.
    [ ] Un article peut être catégorisé.
    [ ] Un fournisseur peut être créé.
    [ ] Un stock peut être consulté.
    [ ] Une réception peut être enregistrée.
    [ ] Une sortie peut être enregistrée.
    [ ] Le stock est correctement mis à jour.
    [ ] Chaque mouvement possède un historique.
    [ ] Une alerte apparaît lorsque le stock est faible.
    [ ] Le dashboard affiche les KPI.
    [ ] Les utilisateurs peuvent rechercher les articles.
    [ ] Les mouvements peuvent être filtrés.
    [ ] Les rapports peuvent être générés.
    [ ] Les données peuvent être exportées.
    [ ] Les opérations sensibles sont auditées.
    [ ] Un inventaire peut être effectué.
    [ ] Les écarts peuvent être enregistrés.


================================================================================
59. LIVRABLES
================================================================================

Le projet final doit contenir :

    1. Application frontend.
    2. API backend.
    3. Base de données PostgreSQL.
    4. Scripts de migration.
    5. Documentation API.
    6. Documentation technique.
    7. Guide utilisateur.
    8. Diagramme ERD.
    9. Diagrammes UML si nécessaires.
   10. Tests.
   11. Configuration Docker.
   12. Documentation de déploiement.
   13. Présentation finale.


================================================================================
60. RÉSULTAT FINAL ATTENDU
================================================================================

L'utilisateur doit pouvoir entrer dans l'application et comprendre
rapidement :

    COMBIEN avons-nous ?
    OÙ se trouvent les articles ?
    QUELS articles sont critiques ?
    QU'EST-CE QUI EST ENTRÉ ?
    QU'EST-CE QUI EST SORTI ?
    QUI a effectué l'opération ?
    QUAND ?
    POURQUOI ?
    QUELLE demande est associée ?
    QUELLE est la situation actuelle du stock ?


Le système doit donc être construit autour de quatre principes :

    1. VISIBILITÉ
       Savoir ce qui existe et où.

    2. TRAÇABILITÉ
       Savoir qui a fait quoi et quand.

    3. CONTRÔLE
       Empêcher les opérations incohérentes.

    4. AIDE À LA DÉCISION
       Donner des indicateurs, alertes et rapports.


================================================================================
61. VISION GLOBALE DU SYSTÈME
================================================================================


                         PHOSBOUCRAA INVENTORY
                                  |
             +--------------------+--------------------+
             |                    |                    |
             v                    v                    v
        UTILISATEURS            STOCK               REPORTING
             |                    |                    |
       +-----+------+       +-----+------+        +----+-----+
       |            |       |            |        |          |
      Admin       Manager  Articles   Mouvements Dashboard Rapports
       |            |       |            |
       |         Demandes   |       +----+----+
       |            |       |       |    |    |
       |            |       |      IN  OUT TRANSFER
       |            |       |
       +------------+-------+
                    |
                PERMISSIONS
                    |
                    v
                  AUDIT
                    |
                    v
              TRAÇABILITÉ


================================================================================
FIN DU CAHIER DES CHARGES
================================================================================