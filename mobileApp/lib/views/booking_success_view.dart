import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/app_theme.dart';
import '../widgets/custom_button.dart';
import '../main.dart';

class BookingSuccessView extends StatelessWidget {
  const BookingSuccessView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  color: Colors.amberAccent,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  LucideIcons.checkCircle,
                  color: Colors.amber,
                  size: 48,
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                "Payment Successful!",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                "Your WaafiPay payment was received successfully. Your order has been created and is now being processed.",
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppTheme.textSecondary,
                  height: 1.5,
                  fontSize: 15,
                ),
              ),
              const SizedBox(height: 48),
              CustomButton(
                text: "View My Orders",
                onPressed: () {
                  // Switch MainNavigation tab to Orders (Index 4)
                  MainNavigation.selectedTabNotifier.value = 4;
                  // Pop back to root MainNavigation
                  Navigator.popUntil(context, (route) => route.isFirst);
                },
                icon: const Icon(
                  LucideIcons.receipt,
                  color: Colors.white,
                  size: 18,
                ),
              ),
              const SizedBox(height: 16),
              CustomButton(
                text: "Back to Catalog",
                isSecondary: true,
                onPressed: () {
                  // Switch MainNavigation tab to Explore/Explore (Index 1)
                  MainNavigation.selectedTabNotifier.value = 1;
                  // Pop back to root MainNavigation
                  Navigator.popUntil(context, (route) => route.isFirst);
                },
                icon: const Icon(
                  LucideIcons.arrowRight,
                  color: AppTheme.textPrimary,
                  size: 18,
                ),
              ),
              const Spacer(),
              const Text(
                "Need help? Contact support@decorrent.com",
                style: TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
