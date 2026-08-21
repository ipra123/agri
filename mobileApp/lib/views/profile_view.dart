import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../widgets/custom_button.dart';
import '../providers/auth_provider.dart';
import 'auth/login_view.dart';
import 'auth/register_view.dart';
import '../main.dart';
import 'report_view.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return Scaffold(
          appBar: AppBar(
            title: const Text("My Account"),
            centerTitle: false,
            actions: [
              if (authProvider.isAuthenticated)
                IconButton(
                  onPressed: () {},
                  icon: const Icon(
                    LucideIcons.settings,
                    color: AppTheme.textPrimary,
                  ),
                ),
            ],
          ),
          body: authProvider.isAuthenticated
              ? _buildAuthenticatedProfile(context, authProvider)
              : _buildUnauthenticatedProfile(context),
        );
      },
    );
  }

  Widget _buildUnauthenticatedProfile(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 420),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: AppTheme.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 24,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  LucideIcons.userX,
                  color: AppTheme.primary,
                  size: 42,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                "Not Logged In",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                "Sign in to manage your orders, saved items, and profile details.",
                textAlign: TextAlign.center,
                style: TextStyle(color: AppTheme.textSecondary, height: 1.5),
              ),
              const SizedBox(height: 28),
              CustomButton(
                text: "Login",
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginView()),
                  );
                },
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const RegisterView()),
                  );
                },
                child: const Text(
                  'Create an Account',
                  style: TextStyle(
                    color: AppTheme.primary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAuthenticatedProfile(
    BuildContext context,
    AuthProvider authProvider,
  ) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 96),
        child: Column(
          children: [
            _buildProfileCard(authProvider),
            const SizedBox(height: 20),
            _buildQuickStats(),
            const SizedBox(height: 20),
            _buildActionList(),
            const SizedBox(height: 20),
            _buildLogoutButton(context, authProvider),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard(AuthProvider authProvider) {
    final user = authProvider.user;
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        children: [
          Stack(
            children: [
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.primary.withOpacity(0.18),
                      AppTheme.accent.withOpacity(0.15),
                    ],
                  ),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  LucideIcons.user,
                  size: 48,
                  color: AppTheme.primary,
                ),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: AppTheme.primary,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    LucideIcons.camera,
                    color: Colors.white,
                    size: 14,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            user?.fullName ?? "User",
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            user?.email ?? "",
            style: const TextStyle(color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStats() {
    final stats = [
      {"label": "Orders", "value": "12", "icon": LucideIcons.receipt},
      {"label": "Active", "value": "2", "icon": LucideIcons.clock},
      {"label": "Spent", "value": "\$1.2k", "icon": LucideIcons.creditCard},
    ];

    return Row(
      children: stats.map((stat) {
        return Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 6),
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppTheme.border),
            ),
            child: Column(
              children: [
                Icon(
                  stat['icon'] as IconData,
                  size: 20,
                  color: AppTheme.primary,
                ),
                const SizedBox(height: 10),
                Text(
                  stat['value'] as String,
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 18,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  stat['label'] as String,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildActionList() {
    final actions = [
      {
        "title": "Account Activity",
        "subtitle": "Review your account updates",
        "icon": LucideIcons.activity,
      },
      {
        "title": "Financial Report",
        "subtitle": "View statements and metrics",
        "icon": LucideIcons.fileSpreadsheet,
      },
      {
        "title": "Notifications",
        "subtitle": "Updates and alerts",
        "icon": LucideIcons.bellRing,
      },
      {
        "title": "Manage Payments",
        "subtitle": "Cards and billing info",
        "icon": LucideIcons.wallet,
      },
      {
        "title": "Support Center",
        "subtitle": "Get help with orders",
        "icon": LucideIcons.headphones,
      },
    ];

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: actions.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final action = actions[index];
        return ListTile(
          onTap: () {
            if (action['title'] == "Financial Report") {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ReportView()),
              );
            }
          },
          tileColor: AppTheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(22),
            side: const BorderSide(color: AppTheme.border),
          ),
          leading: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppTheme.background,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              action['icon'] as IconData,
              color: AppTheme.primary,
              size: 20,
            ),
          ),
          title: Text(
            action['title'] as String,
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 15,
              color: AppTheme.textPrimary,
            ),
          ),
          subtitle: Text(
            action['subtitle'] as String,
            style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
          ),
          trailing: const Icon(
            LucideIcons.chevronRight,
            size: 18,
            color: AppTheme.textSecondary,
          ),
        );
      },
    );
  }

  Widget _buildLogoutButton(BuildContext context, AuthProvider authProvider) {
    return TextButton(
      onPressed: () => authProvider.logout(),
      style: TextButton.styleFrom(
        foregroundColor: Colors.redAccent,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 18),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: BorderSide(color: Colors.redAccent.withOpacity(0.18)),
        ),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.logOut, size: 20),
          SizedBox(width: 8),
          Text("Logout session", style: TextStyle(fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}
