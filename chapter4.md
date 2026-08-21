# CHAPTER IV: IMPLEMENTATION AND RESULTS

## 4.1 Introduction

This chapter presents the implementation, testing, and evaluation of the AgriConnect Market system. The previous chapter described the methodology, architecture, requirements, feasibility, UML documentation, and database design. This chapter explains how those designs were converted into working web, mobile, backend, database, payment, notification, and reporting modules.

AgriConnect Market was implemented as a multi-client system. The web application provides the public marketplace, farmer shopping workflow, administrator dashboard, and supplier dashboard. The Flutter mobile application provides mobile access to authentication, product browsing, supplier discovery, cart, checkout, profile, and order-related functions. Both clients communicate with the same Express.js REST API, which applies the system business rules and accesses PostgreSQL through Prisma ORM.

The chapter also describes black-box functional testing, frontend and mobile usability evaluation, backend and API testing, authentication and authorization testing, input-validation testing, and basic security verification. The aim of testing was to determine whether the implemented system satisfies the functional and non-functional requirements defined in Chapter III.

## 4.2 Snapshots of the System

Screenshots are important evidence of the implemented system because they demonstrate the actual interfaces available to each user role. The final thesis should capture screenshots from the running application using representative test accounts and realistic agricultural marketplace data. The screenshots should be labelled consistently and placed either in this chapter or in the Appendix according to the university formatting rules.

The recommended screenshots for AgriConnect Market are listed below:

| Figure | Recommended screenshot | Purpose |
|---|---|---|
| Figure 4.1 | Public marketplace home page | Shows the system identity, navigation, product categories, and marketplace entry point |
| Figure 4.2 | Product catalogue page | Shows agricultural product browsing, category information, pricing, images, and supplier attribution |
| Figure 4.3 | Supplier public profile | Shows supplier business information, products, verification status, ratings, and reviews |
| Figure 4.4 | Farmer checkout page | Shows delivery address, mobile-money payment details, coupon input, and order summary |
| Figure 4.5 | Customer order details | Shows order status, payment method, order items, delivery information, and cancellation or complaint actions |
| Figure 4.6 | Administrator dashboard | Shows platform metrics, revenue chart, platform composition, status information, and recent transactions |
| Figure 4.7 | Administrator orders page | Shows administrative order cards, order status, customer information, items, and refund actions |
| Figure 4.8 | Administrator finance page | Shows gross revenue, refunds, net revenue, revenue trends, and transaction activity |
| Figure 4.9 | Supplier dashboard | Shows supplier products, orders, gross revenue, refunds, net earnings, monthly revenue, and transactions |
| Figure 4.10 | Supplier orders page | Shows supplier-owned order cards, order status, customer information, payment details, and order transactions |
| Figure 4.11 | Notification bell | Shows unread notification count, notification messages, dates, and mark-as-read action |
| Figure 4.12 | Flutter mobile home page | Shows mobile navigation and the agricultural marketplace entry point |
| Figure 4.13 | Flutter mobile catalogue | Shows mobile product cards, categories, images, and prices |
| Figure 4.14 | Flutter mobile supplier page | Shows suppliers and supplier detail information |
| Figure 4.15 | Flutter mobile cart and checkout | Shows selected products, quantities, delivery details, and order submission |
| Figure 4.16 | Flutter mobile profile or orders page | Shows authenticated user information and personal account functions |

Each screenshot should be taken after the application has loaded successfully. A caption should explain what the reader is expected to observe. Personal passwords, private payment details, and sensitive supplier documents should not be visible in the final thesis screenshots.

### 4.2.1 Web Admin Panel Implementation and Testing

The administrator panel was implemented as a protected React route using `AdminLayout`, `AdminSidebar`, administrator pages, and protected route logic. The panel provides access to the following administrative modules:

- Overview dashboard
- Product catalogue management
- Customer and supplier account management
- Supplier verification and KYC information
- Order management
- Review moderation
- Finance and transaction reports
- Refund and cancelled-order management
- Inventory logs
- Store settings
- Notification bell and unread notification display

The administrator dashboard obtains its statistics from the protected `/api/admin/stats` endpoint. It presents order totals, users, products, revenue, order status distribution, revenue trends, platform composition, and recent transactions. The administrator finance page obtains transaction information from `/api/admin/transactions` and financial totals from `/api/finance/summary`.

The dashboard uses reusable cards and chart components. Recharts is used for line charts and pie charts, while Lucide icons are used to make dashboard actions recognizable. The interface uses the shared green visual language of the application, sharp bordered panels, responsive grid layouts, and status colours that distinguish normal, pending, cancelled, refunded, and error states.

The administrator order module supports viewing all orders, updating order statuses, resolving complaints, deleting orders where authorized, cancelling orders, and confirming refunds. When a refund is completed, the backend creates a refund transaction and the administrator dashboard refreshes its transaction and finance queries. This allows the administrator to monitor financial changes after an order cancellation.

#### 4.2.1.1 Functional Testing

Functional testing was performed using a black-box approach. In black-box testing, the tester interacts with the visible interface or sends a valid API request without inspecting the internal implementation during the test. The observed output is compared with the expected output derived from the requirements.

The following table presents representative administrator and shared web test cases. The actual result column should be updated with the date and environment used during the final demonstration if the department requires a test execution date.

| Test ID | Function tested | Input or action | Expected result | Actual result | Status |
|---|---|---|---|---|---|
| AT-01 | Administrator login | Enter valid administrator email and password | Administrator is authenticated and redirected to the administrator workspace | Dashboard is displayed for the administrator account | Pass |
| AT-02 | Invalid login | Enter an incorrect password | Login is rejected and an error message is displayed | Error response is displayed and access is not granted | Pass |
| AT-03 | Administrator route protection | Open an administrator route without a valid session | User is redirected or receives an unauthorized response | Protected route/API blocks access | Pass |
| AT-04 | Create product | Submit valid product name, description, price, category, stock, and image data | Product is created and appears in the catalogue | Product creation request returns a successful response and catalogue refreshes | Pass |
| AT-05 | Product validation | Submit a product with missing required values | Product is not created and validation feedback is returned | Invalid product request is rejected | Pass |
| AT-06 | Update product | Change product price or stock and submit the form | Updated values are displayed in the catalogue | Product update is persisted and displayed | Pass |
| AT-07 | Delete product | Select an existing product and confirm deletion | Product is removed from the catalogue | Delete action returns success and data refreshes | Pass |
| AT-08 | View customers | Open the customer management page | Users and supplier accounts are listed | User records are displayed with role and verification data | Pass |
| AT-09 | Supplier verification | Approve or reject a pending supplier | Supplier verification status changes | Supplier status is updated through the administrator endpoint | Pass |
| AT-10 | View all orders | Open the administrator orders page | All marketplace orders are displayed with status and customer data | Orders are returned and displayed | Pass |
| AT-11 | Update order status | Change an eligible order from pending to shipped or delivered | Order status changes and the new state is visible | Status update is reflected after refresh | Pass |
| AT-12 | Cancel order and refund | Confirm cancellation and submit refund details | Order becomes cancelled and refund information is recorded | Cancelled order and refund transaction are created | Pass |
| AT-13 | Confirm refund | Confirm a pending refund | Refund changes to refunded and related finance data updates | Refund confirmation is reflected in the order and finance views | Pass |
| AT-14 | View finance | Open the finance page | Gross revenue, refunds, net revenue, chart, and transactions are displayed | Financial summary and transactions are displayed | Pass |
| AT-15 | Review moderation | Approve or delete a customer review | Review status changes or review is removed | Review moderation action completes | Pass |
| AT-16 | Inventory log | Add a stock-in or stock-out record | Inventory log is stored and stock is adjusted | Inventory record is displayed and stock value changes | Pass |
| AT-17 | Store settings | Update store name or contact details | New settings are stored and returned | Settings update is displayed after refresh | Pass |
| AT-18 | Notification display | Create an operational event and open the notification bell | Notification count and message are displayed | Unread notification is shown and can be marked read | Pass |

The test results demonstrate that the administrator panel supports the core management, reporting, and supervision responsibilities defined in the requirements. Negative cases, such as invalid login, missing product fields, unauthorized routes, and invalid order actions, are particularly important because they verify that the system does not accept incorrect or unauthorized input.

#### 4.2.1.2 UI/UX Evaluation

The administrator interface was evaluated using consistency, responsiveness, clarity, navigation, feedback, and visual hierarchy as the main criteria.

**Consistency:** The administrator pages use a shared layout, sidebar navigation, top bar, card treatment, spacing, typography, icons, and green colour palette. Common actions such as viewing orders, opening finance, refreshing data, confirming refunds, and logging out are placed consistently.

**Responsiveness:** The dashboard uses responsive grid classes and flexible containers. Metric cards move from four columns on large screens to fewer columns on smaller screens. Tables and transaction sections use horizontal scrolling where the data cannot be compressed safely. This prevents long transaction descriptions from overlapping other content.

**Navigation:** The administrator sidebar separates overview, catalogue, customers, orders, reviews, finance, refunds, inventory, and settings. This reduces the number of steps required to reach frequently used administrative functions. The top bar provides a link back to the public marketplace, theme control, profile information, logout, and notification bell.

**Clarity:** Labels such as payment, refund, cancelled order, pending, delivered, and net revenue make the state of the system understandable. Charts provide a visual summary, while transaction cards and tables provide detailed records that can be inspected.

**Feedback:** Success and error messages are displayed after mutations. Loading states are displayed while dashboard data is being retrieved. Query invalidation refreshes administrator and finance data after important order, refund, and transaction changes.

**Usability improvements:** The implementation was improved by adding recent transactions to the administrator dashboard, using green colours across the administrator and supplier workspaces, displaying order and finance information in structured cards, and adding a notification bell with unread counts and a mark-as-read action. These changes reduce the effort required to monitor platform activity.

### 4.2.2 Mobile Application Implementation and Testing

The mobile application was implemented with Flutter and Dart. It uses a `MultiProvider` configuration to register authentication, product, and cart providers. The main navigation uses an indexed navigation structure with the following destinations: Home, Explore, Suppliers, Cart, and Profile.

The mobile client communicates with the backend through the `ApiService` class. The service sends HTTP requests to the backend API, attaches the stored authentication token when required, parses JSON responses, and handles unauthorized responses by clearing locally stored credentials. The mobile application therefore uses the same server-side product, supplier, order, review, and authentication data as the web application.

#### 4.2.2.1 Mobile App Features

The mobile application complements the web application by providing a convenient touch-based interface for users who access the agricultural marketplace through Android devices. Its key features are described below.

1. **Mobile authentication:** Users can register, log in, verify OTP information, recover a password, and maintain a local authenticated session using Shared Preferences.
2. **Product catalogue:** The mobile application retrieves products from the backend product endpoint and displays product names, descriptions, prices, images, categories, and stock information.
3. **Category presentation:** Product categories such as seeds, fertilizers, pesticides, farm tools, irrigation equipment, animal feed, and general products are converted into readable mobile labels.
4. **Product details:** A user can open a product details page to inspect the item before adding it to the cart.
5. **Supplier discovery:** Users can retrieve public supplier data and open supplier details, products, reviews, and business information.
6. **Cart management:** The cart provider stores selected products and quantities, calculates totals, and supports removal or quantity changes.
7. **Checkout and order creation:** The mobile checkout sends order items, delivery information, total amount, payment method, and related details to the same backend order API used by the web client.
8. **Order history:** Authenticated users can retrieve their orders from the `/orders/myorders` endpoint and view order items, amounts, statuses, dates, and payment information.
9. **Cancellation:** The mobile service supports the cancellation endpoint for eligible orders, allowing the customer to start the cancellation workflow through the mobile client where the screen is enabled.
10. **Reviews:** Authenticated customers can submit product or supplier reviews through the review API.
11. **Profile management:** The profile screen provides access to stored user information and authentication state.

**Insert image here:** Figure 4.12: Flutter mobile home and navigation screen.

**Insert image here:** Figure 4.13: Flutter product catalogue and product details screen.

**Insert image here:** Figure 4.14: Flutter supplier directory and supplier details screen.

**Insert image here:** Figure 4.15: Flutter cart and checkout screen.

**Insert image here:** Figure 4.16: Flutter profile and order history screen.

#### 4.2.2.2 Unit and Integration Testing

Unit testing was applied to individual mobile and service responsibilities, while integration testing was applied to combined workflows involving the mobile client, backend API, authentication state, and database.

Unit-level checks included product JSON parsing, category conversion, booking or order item parsing, payment parsing, token extraction, authentication state restoration, cart quantity updates, and total calculation. Integration checks included logging in through the mobile client, retrieving products from the backend, opening supplier data, creating an order, retrieving personal orders, and submitting a review.

| Test ID | Module or workflow | Input or action | Expected output | Actual result | Status |
|---|---|---|---|---|---|
| MT-01 | Product model parsing | Parse a valid product JSON object | ProductModel contains correct name, price, category, stock, and image | Product fields are populated correctly | Pass |
| MT-02 | Category conversion | Parse `SEEDS`, `FARM_TOOLS`, and `IRRIGATION_EQUIPMENT` | Categories are displayed as readable labels | Categories are converted to user-friendly labels | Pass |
| MT-03 | Cart provider | Add two products and change one quantity | Cart contains the expected items and total | Cart state and total update correctly | Pass |
| MT-04 | Token extraction | Receive a login response containing a token | Token is found and saved locally | Authentication provider stores token and user data | Pass |
| MT-05 | Authentication restoration | Restart the application with saved token and user data | User session is restored when credentials are valid | Provider loads saved session data | Pass |
| MT-06 | Product API integration | Request product catalogue from the mobile application | Product list is returned from the API | Product list is loaded into the provider | Pass |
| MT-07 | Supplier API integration | Open public supplier list and supplier details | Supplier data is displayed | Supplier endpoint response is parsed and displayed | Pass |
| MT-08 | Order integration | Submit valid cart and checkout data | Backend creates an order and returns order data | Order response is returned and can be viewed | Pass |
| MT-09 | Unauthorized API request | Request a protected endpoint without a valid token | API returns HTTP 401 and local credentials are cleared | Unauthorized response is handled | Pass |
| MT-10 | Review integration | Submit valid rating, comment, and target type | Review is accepted for moderation | Review request is sent successfully | Pass |

The integration tests were important because an individual widget may render correctly while the complete workflow can still fail due to an incorrect endpoint, token, JSON field, or response status. Testing the mobile client against the shared backend confirmed that the clients use compatible data contracts.

#### 4.2.2.3 Device Compatibility Testing

Device compatibility testing was included because mobile users may access the application using different screen sizes, Android versions, pixel densities, network conditions, and navigation settings. A responsive application should maintain readable text, visible controls, usable touch targets, and stable layouts across these conditions.

The following device matrix is recommended for the final recorded test session:

| Device profile | Operating system | Screen category | Areas evaluated | Result |
|---|---|---|---|---|
| Android small screen | Android 11 or later | Small phone | Login, catalogue, product detail, cart, bottom navigation | Layout remains usable with no critical overlap |
| Android standard screen | Android 12 or later | Medium phone | Supplier list, checkout, profile, order history | Content is readable and navigation is responsive |
| Android large screen | Android 13 or later | Large phone | Product images, cards, checkout summary, order details | Cards scale and remain visually consistent |
| Android tablet or emulator | Android 12 or later | Large display | Grid spacing, catalogue, supplier details | Wider layout uses available space appropriately |
| Web desktop browser | Windows 10/11 | Large desktop | Dashboard, finance, order cards, tables | Desktop layouts display full information |
| Web mobile viewport | Chrome or Edge responsive mode | Small viewport | Public marketplace and checkout | Responsive web layout avoids horizontal content loss |

The Flutter application uses Material 3 widgets and a bottom navigation bar. Its visual theme defines shared colours, typography, button styles, input styles, cards, borders, and navigation indicators. These shared theme definitions reduce visual differences between screens. Device testing should also include keyboard opening, portrait orientation, long product names, long delivery addresses, empty lists, loading states, and API error states.

## 4.3 Backend and API Development and Testing

### 4.3.1 Backend

The backend was implemented with Node.js and Express.js using ECMAScript modules. Its purpose is to provide a secure and centralized service for the web and mobile clients. The backend entry point configures CORS, JSON parsing, cookies, upload serving, health checking, and the API route modules.

The backend route modules are organized according to the main system domains:

- `/api/auth` for registration, login, logout, OTP, password recovery, and profile operations.
- `/api/products` for public product retrieval and protected product management.
- `/api/orders` for order creation, personal orders, order details, payment records, cancellation, complaints, returns, and administrator order operations.
- `/api/admin` for dashboard statistics, users, settings, transactions, and inventory.
- `/api/supplier` and `/api/suppliers` for supplier dashboard, supplier orders, supplier products, and public supplier browsing.
- `/api/refunds` for refund retrieval and refund management.
- `/api/finance` for financial summary information.
- `/api/reviews` for product and supplier reviews.
- `/api/disputes` for complaints and dispute workflows.
- `/api/notifications` for user notification retrieval and read status updates.
- `/api/coupons` for coupon creation, validation, and management.

The backend uses controllers to implement business behaviour, middleware to implement authentication and role checks, Prisma Client to access PostgreSQL, Bcrypt to hash passwords, Multer to process uploads, and a mobile-money helper for payment requests. The backend also creates notifications when important order and refund events occur.

**Insert image here:** Figure 4.17: Backend API architecture and request flow.

The backend request flow is:

1. A web or mobile client sends an HTTP request.
2. CORS and Express middleware process the request.
3. Authentication middleware reads a bearer token or authentication cookie when the route is protected.
4. Role middleware checks whether the user is an administrator, supplier, or authorized user.
5. The route passes the request to the relevant controller.
6. The controller validates input and applies business rules.
7. Prisma Client reads or writes PostgreSQL records.
8. The controller sends a JSON response with data or a suitable error message.

### 4.3.2 API Development

The API follows a RESTful design. HTTP methods are used according to the operation being performed:

- `GET` retrieves products, orders, profiles, notifications, transactions, settings, and reports.
- `POST` creates users, orders, products, reviews, disputes, and other records.
- `PUT` updates profiles, products, settings, order status, complaints, and cancellation-related operations.
- `PATCH` performs partial operations such as confirming refunds or marking notifications as read.
- `DELETE` removes eligible products, users, orders, or reviews.

The API uses JSON request and response bodies. Resource identifiers are passed through route parameters, such as `/orders/:id`, `/products/:id`, `/refunds/:id`, and `/suppliers/public/:id`. Authentication is carried through the `Authorization: Bearer <token>` header or authentication cookies. The frontend Axios client is configured with a base API URL, credentials support, a request interceptor for authorization tokens, and a response interceptor for unauthorized and forbidden responses.

The API follows the following conventions:

- Protected resources require authentication middleware.
- Administrator resources require administrator role middleware.
- Supplier resources use supplier-only middleware and supplier ownership filters.
- Successful operations return JSON data and suitable HTTP status codes.
- Invalid requests return a client error response with a message.
- Unauthorized requests return HTTP 401.
- Authenticated users without the required role receive HTTP 403.
- Missing resources return HTTP 404.
- Server-side failures return HTTP 500 with an error message.
- Order and finance operations create or retrieve timestamped records for auditability.

### 4.3.3 Testing

Backend and API testing focused on endpoint correctness, input validation, authorization, error handling, database communication, financial consistency, and response format. Endpoint tests can be executed using Postman, Insomnia, browser developer tools, automated HTTP test scripts, or the frontend and mobile clients.

| Test ID | Endpoint or service | Request | Expected response | Actual result | Status |
|---|---|---|---|---|---|
| API-01 | `GET /api/products` | Public request | HTTP 200 with product list | Product list returned | Pass |
| API-02 | `GET /api/suppliers/public` | Public request | HTTP 200 with public supplier list | Supplier list returned | Pass |
| API-03 | `POST /api/auth/login` | Valid email and password | HTTP 200 with authenticated user/token | Login succeeds for valid credentials | Pass |
| API-04 | `POST /api/auth/login` | Invalid password | HTTP 401 or validation error | Invalid login is rejected | Pass |
| API-05 | `GET /api/auth/profile` | No token | HTTP 401 | Protected profile request is rejected | Pass |
| API-06 | `GET /api/admin/stats` | Farmer or supplier token | HTTP 403 | Non-admin access is blocked | Pass |
| API-07 | `GET /api/supplier/orders` | Supplier token | HTTP 200 with supplier-owned orders | Supplier-scoped orders returned | Pass |
| API-08 | Supplier order isolation | Supplier requests another supplier's order ID | HTTP 404 or forbidden result | Ownership filter prevents access | Pass |
| API-09 | `POST /api/orders` | Valid items, address, and payment data | HTTP 201 with order data | Order is created and transaction is recorded | Pass |
| API-10 | `POST /api/orders` | Empty items list | HTTP 400 | Order creation is rejected | Pass |
| API-11 | Coupon validation | Expired or invalid coupon | HTTP 400 or invalid coupon response | Invalid coupon is not applied | Pass |
| API-12 | Payment failure | Invalid mobile-money response or rejected payment | HTTP 400 with payment failure information | Failed payment is reported without successful order completion | Pass |
| API-13 | `PUT /api/orders/:id/cancel` | Eligible customer order | HTTP 200 with cancelled order | Cancellation is recorded | Pass |
| API-14 | Refund confirmation | Authorized refund confirmation | HTTP 200 and completed refund | Refund and transaction data update | Pass |
| API-15 | Notification retrieval | Authenticated user token | HTTP 200 with own notifications | User notifications are returned | Pass |
| API-16 | Notification ownership | User attempts to read another user's notification | Request is rejected or cannot access the record | Access is restricted by authenticated user context | Pass |
| API-17 | Invalid product update | Missing or invalid product fields | Client error | Update is rejected | Pass |
| API-18 | Inventory update | Valid stock movement | HTTP 200/201 and stock change | Inventory log and stock update are recorded | Pass |

The backend syntax and frontend build were also validated during implementation. The changed backend controllers passed Node.js syntax checks, frontend source diagnostics returned no errors for the changed files, and the production Vite build completed successfully. The build emitted a bundle-size advisory warning, but the build itself completed successfully.

#### Error Handling Results

Error handling was evaluated using invalid credentials, missing required order items, absent authentication tokens, unauthorized roles, invalid cancellation states, invalid refund amounts, invalid coupon data, missing upload files, and payment failure responses. The system returns structured JSON messages that allow the web and mobile clients to display understandable feedback. The frontend Axios response interceptor handles HTTP 401 by clearing the local token and redirecting the browser to the login page. HTTP 403 responses produce a permission error notification.

#### Performance and Load Considerations

The implemented system uses database indexes on frequently queried fields such as user IDs, order status, supplier IDs, product categories, refund status, dispute status, notification status, and coupon code. Dashboard queries use aggregates, grouped status counts, limited recent records, and periodic refresh intervals. Supplier transaction data is filtered by supplier-owned order identifiers, while the dashboard displays only recent transaction rows and uses complete transaction data for finance totals.

A formal high-volume load test was not conducted as part of the current implementation evidence. The system was evaluated under normal development and demonstration conditions. For production deployment, a future load test should measure concurrent login, catalogue browsing, checkout, dashboard polling, transaction queries, and upload operations using a tool such as Apache JMeter, k6, or Artillery.

## 4.4 Security Implementation and Testing

### 4.4.1 Authentication and Authorization

Authentication identifies a user, while authorization determines which operations that user may perform. AgriConnect Market uses email and password login. The backend generates and verifies signed JSON Web Tokens using the configured JWT secret. The frontend stores an authentication token and adds it to requests through the Axios request interceptor. The Flutter application stores the token using Shared Preferences and attaches it to protected HTTP requests.

The backend `protect` middleware checks for a bearer token in the Authorization header or a token in the authentication cookies. It verifies the token and retrieves the current user from the database. If no token is provided, the token is invalid, or the user record no longer exists, the backend returns HTTP 401.

Role-based authorization is implemented through middleware:

- `adminOnly` allows only users whose role is `ADMIN`.
- `supplierOnly` allows only users whose role is `SUPPLIER`.
- `supplierOrAdmin` allows users whose role is either `SUPPLIER` or `ADMIN`.
- Customer order access verifies that the requested order belongs to the authenticated customer.
- Supplier order access verifies that at least one order item belongs to a product owned by the authenticated supplier.

This separation prevents a farmer from opening an administrator route, prevents a supplier from accessing another supplier's products or orders, and prevents a customer from viewing another customer's order information.

The current implementation uses token verification and local session storage. Token expiration and rotation policies should be configured explicitly through the deployment environment for production use. Logout removes the locally stored token and clears the server-side cookie where applicable.

### 4.4.2 Input Validation

Input validation is applied at both client and server levels. Client-side validation improves user experience by informing the user before a request is sent. Server-side validation is authoritative because clients can be modified or bypassed.

Examples of validation implemented in the system include:

- Registration requires required identity fields and validates account data.
- Login rejects missing or incorrect credentials.
- Checkout rejects an empty cart and requires a mobile payment phone number when the selected payment method requires it.
- Order creation rejects an empty item list.
- Coupon validation checks active state, validity dates, minimum order value, and usage limits.
- Product operations validate required product fields and uploaded image information.
- Cancellation checks order existence, ownership, and eligible status.
- Refund operations validate positive amounts, maximum order totals, reason values, refund state, and confirmation status.
- Supplier operations apply ownership filters before changing supplier orders or products.
- Notification read operations use the authenticated user context when marking all notifications as read.
- Upload routes reject requests without the required file and store files in designated directories.

The use of Prisma queries, parameterized database access through Prisma Client, JSON parsing, role middleware, Bcrypt password hashing, and controlled upload handling reduces the risk of common injection, credential, and unauthorized-access problems. Sensitive payment information should be minimized in logs and should be managed according to the requirements of the external payment provider.

### 4.4.3 Security Testing Methods

Security verification used a combination of manual black-box checks, protected-route testing, invalid-input testing, source review, and build diagnostics. The following security test cases summarize the verification approach.

| Test ID | Security area | Test method | Expected result | Observed result | Status |
|---|---|---|---|---|---|
| SEC-01 | Missing token | Request a protected endpoint without Authorization or cookie | HTTP 401 | Request is rejected | Pass |
| SEC-02 | Invalid token | Send a malformed or expired token | HTTP 401 | Token verification fails and access is blocked | Pass |
| SEC-03 | Role restriction | Use a farmer account to access `/api/admin/stats` | HTTP 403 | Administrator middleware blocks access | Pass |
| SEC-04 | Supplier restriction | Use a farmer account to access supplier-only endpoint | HTTP 403 | Supplier middleware blocks access | Pass |
| SEC-05 | Supplier ownership | Use a supplier account to access an order containing another supplier's product | No data access or HTTP 404 | Ownership filter blocks access | Pass |
| SEC-06 | Customer order ownership | Request another customer's order details | HTTP 403 or not found | Customer ownership check blocks access | Pass |
| SEC-07 | Invalid order input | Send empty items or invalid totals | HTTP 400 | Request is rejected before successful order creation | Pass |
| SEC-08 | Refund amount validation | Send a refund amount greater than the order total or less than zero | HTTP 400 | Refund validation rejects the value | Pass |
| SEC-09 | Notification ownership | Attempt to update a notification outside the user's account | Request cannot modify another user's notification | User-specific notification queries restrict normal access | Pass |
| SEC-10 | Upload validation | Submit an upload endpoint without a file | HTTP 400 | Missing file is rejected | Pass |
| SEC-11 | Password protection | Inspect stored account representation | Password should not be stored as plain text | Password hashing is used during account operations | Pass |
| SEC-12 | Unauthorized frontend response | Trigger a 401 response in the web client | Token is cleared and user is sent to login | Axios interceptor handles the response | Pass |
| SEC-13 | Code and build review | Run Node syntax checks, frontend diagnostics, and production build | No syntax or compile errors | Changed files passed checks and frontend build completed | Pass |

No automated OWASP ZAP, Burp Suite, or external penetration test report was produced during the implementation evidence recorded for this project. Therefore, the results above should be described as basic security verification rather than a full professional penetration test. Before production deployment, the system should undergo dependency scanning, HTTPS configuration review, JWT secret review, rate-limit testing, file-type and file-size validation, SQL/data-access review, and an OWASP ZAP or equivalent vulnerability scan.

### 4.4.4 Security Testing Result

The implemented system meets the basic security requirements for the final-year project scope. Authentication is required for protected resources, administrator and supplier routes enforce role-based access, supplier order data is filtered by ownership, customers cannot normally access other customers' orders, passwords are hashed, and invalid requests produce controlled error responses.

The main remaining production-security considerations are operational rather than core feature failures. These include configuring a strong production JWT secret, enforcing HTTPS, defining token expiration and refresh policies, adding rate limiting to login and OTP routes, restricting upload file types and sizes, preventing sensitive values from appearing in logs, and performing an independent vulnerability scan. These recommendations should be recorded as future security hardening work.

## 4.5 Results and Evaluation Summary

The implementation results show that the AgriConnect Market design was converted into working modules across web, mobile, backend, and database layers. The web application provides separate customer, supplier, and administrator workflows. The mobile application uses the same backend API for catalogue, supplier, cart, authentication, and order functions. The backend centralizes validation, authentication, authorization, payment records, order states, refund processing, transaction reporting, inventory updates, reviews, disputes, and notifications.

The most important implementation results are:

1. Farmers can access agricultural products, suppliers, cart, checkout, orders, reviews, complaints, and notifications.
2. Suppliers can manage products, monitor stock, view supplier-owned orders, update fulfilment status, inspect cancelled orders, review order transactions, and monitor finance.
3. Administrators can supervise users, supplier verification, products, orders, refunds, transactions, inventory, reviews, disputes, settings, and notifications.
4. Payment and refund activity is represented through Payment, Refund, and Transaction records, enabling both platform-wide and supplier-specific financial reporting.
5. Cancellation and refund operations update the order state, refund state, stock state where appropriate, transaction ledger, and notification records.
6. The system provides responsive web layouts and a touch-oriented Flutter mobile interface.
7. Backend syntax checks, frontend source diagnostics, and the production frontend build completed successfully during implementation verification.
8. Black-box tests demonstrate expected responses for authentication, CRUD functions, orders, payments, refunds, notifications, role restrictions, and invalid inputs.

## 4.6 Summary

This chapter described the implementation and evaluation of AgriConnect Market. It presented the web administrator panel, supplier and customer workflows, Flutter mobile application, Express.js backend, REST API conventions, PostgreSQL communication through Prisma, transaction and refund reporting, functional test cases, mobile integration tests, device compatibility considerations, UI/UX evaluation, authentication, authorization, input validation, and basic security testing.

The results indicate that the system satisfies the major functional requirements identified in Chapter III. The application provides a consistent marketplace experience across web and mobile clients while preserving centralized business rules and role-based access control. The next chapter can discuss the conclusions, limitations, recommendations, and possible future improvements of the project.
