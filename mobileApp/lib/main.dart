import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'views/home_view.dart';
import 'views/catalog_view.dart';
import 'views/cart_view.dart';
import 'views/profile_view.dart';
import 'views/my_bookings_view.dart';
import 'providers/auth_provider.dart';
import 'providers/decoration_provider.dart';
import 'providers/cart_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DecorationProvider()..fetchDecorations()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {

  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DecorRent',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MainNavigation(),
    );
  }
}

class MainNavigation extends StatefulWidget {
  static final ValueNotifier<int> selectedTabNotifier = ValueNotifier<int>(0);
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeView(),
    const CatalogView(),
    const CartView(),
    const MyBookingsView(),
    const ProfileView(),
  ];

  @override
  void initState() {
    super.initState();
    MainNavigation.selectedTabNotifier.addListener(_onTabChanged);
  }

  @override
  void dispose() {
    MainNavigation.selectedTabNotifier.removeListener(_onTabChanged);
    super.dispose();
  }

  void _onTabChanged() {
    setState(() {
      _currentIndex = MainNavigation.selectedTabNotifier.value;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (index) {
                MainNavigation.selectedTabNotifier.value = index;
                setState(() => _currentIndex = index);
              },
              backgroundColor: Colors.transparent,
              elevation: 0,
              type: BottomNavigationBarType.fixed,
              selectedItemColor: AppTheme.primary,
              unselectedItemColor: AppTheme.textSecondary,
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              unselectedLabelStyle: const TextStyle(fontSize: 12),
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(LucideIcons.home),
                  activeIcon: Icon(LucideIcons.home, color: AppTheme.primary),
                  label: 'Home',
                ),
                BottomNavigationBarItem(
                  icon: Icon(LucideIcons.search),
                  activeIcon: Icon(LucideIcons.search, color: AppTheme.primary),
                  label: 'Explore',
                ),
                BottomNavigationBarItem(
                  icon: Icon(LucideIcons.shoppingCart),
                  activeIcon: Icon(LucideIcons.shoppingCart, color: AppTheme.primary),
                  label: 'Cart',
                ),
                BottomNavigationBarItem(
                  icon: Icon(LucideIcons.calendar),
                  activeIcon: Icon(LucideIcons.calendar, color: AppTheme.primary),
                  label: 'My Books',
                ),
                BottomNavigationBarItem(
                  icon: Icon(LucideIcons.user),
                  activeIcon: Icon(LucideIcons.user, color: AppTheme.primary),
                  label: 'Profile',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
