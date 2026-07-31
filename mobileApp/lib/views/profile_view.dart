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
            centerTitle: true,
            actions: [
              if (authProvider.isAuthenticated)
                IconButton(
                  onPressed: () {},
                  icon: const Icon(LucideIcons.settings, color: AppTheme.textPrimary),
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
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.userX, size: 80, color: AppTheme.textSecondary.withOpacity(0.3)),
            const SizedBox(height: 24),
            const Text(
              "Not Logged In",
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 8),
            const Text(
              "Sign in to manage your bookings, save items to your wishlist, and update your profile.",
              textAlign: TextAlign.center,
              style: TextStyle(color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 32),
            CustomButton(
              text: "Login",
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginView()));
              },
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterView()));
              },
              child: const Text('Create an Account', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAuthenticatedProfile(BuildContext context, AuthProvider authProvider) {
    return SingleChildScrollView(
      child: Column(
        children: [
          const SizedBox(height: 32),
          _buildProfileCard(authProvider),
          const SizedBox(height: 32),
          _buildQuickStats(),
          const SizedBox(height: 32),
          _buildActionList(),
          const SizedBox(height: 32),
          _buildLogoutButton(context, authProvider),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildProfileCard(AuthProvider authProvider) {
    final user = authProvider.user;
    return Column(
      children: [
        Stack(
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppTheme.primary.withOpacity(0.1),
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.primary, width: 2),
              ),
              child: const Icon(LucideIcons.user, size: 50, color: AppTheme.primary),
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
                child: const Icon(LucideIcons.camera, color: Colors.white, size: 14),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Text(
          user?.fullName ?? "User",
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
        ),
        const SizedBox(height: 4),
        Text(
          user?.email ?? "",
          style: const TextStyle(color: AppTheme.textSecondary),
        ),
      ],
    );
  }

  Widget _buildQuickStats() {
    final stats = [
      {"label": "Bookings", "value": "12", "icon": LucideIcons.calendar},
      {"label": "Active", "value": "2", "icon": LucideIcons.clock},
      {"label": "Total Spent", "value": "\$1.2k", "icon": LucideIcons.creditCard},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: stats.map((stat) {
          return Container(
            width: 100,
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.border),
            ),
            child: Column(
              children: [
                Icon(stat['icon'] as IconData, size: 20, color: AppTheme.primary),
                const SizedBox(height: 12),
                Text(
                  stat['value'] as String,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
                const SizedBox(height: 4),
                Text(
                  stat['label'] as String,
                  style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildActionList() {
    final actions = [
      {"title": "My Bookings", "subtitle": "Track your event rentals", "icon": LucideIcons.calendarRange},
      {"title": "Financial Report", "subtitle": "View statements and metrics", "icon": LucideIcons.fileSpreadsheet},
      {"title": "Notifications", "subtitle": "Event updates and alerts", "icon": LucideIcons.bellRing},
      {"title": "Manage Payments", "subtitle": "Cards and billing info", "icon": LucideIcons.wallet},
      {"title": "Support Center", "subtitle": "Get help with your orders", "icon": LucideIcons.headphones},
    ];

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: actions.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final action = actions[index];
        return ListTile(
          onTap: () {
            if (action['title'] == "My Bookings") {
              MainNavigation.selectedTabNotifier.value = 3;
            } else if (action['title'] == "Financial Report") {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const ReportView()));
            }
          },
          tileColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppTheme.border),
          ),
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppTheme.background,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(action['icon'] as IconData, color: AppTheme.primary, size: 20),
          ),
          title: Text(
            action['title'] as String,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
          ),
          subtitle: Text(
            action['subtitle'] as String,
            style: const TextStyle(fontSize: 12),
          ),
          trailing: const Icon(LucideIcons.chevronRight, size: 18, color: AppTheme.textSecondary),
        );
      },
    );
  }

  Widget _buildLogoutButton(BuildContext context, AuthProvider authProvider) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: TextButton(
        onPressed: () {
          authProvider.logout();
        },
        style: TextButton.styleFrom(
          foregroundColor: Colors.redAccent,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: Colors.redAccent.withOpacity(0.2)),
          ),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.logOut, size: 20),
            SizedBox(width: 8),
            Text("Logout Session", style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
