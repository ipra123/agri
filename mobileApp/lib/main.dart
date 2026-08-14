import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'views/home_view.dart';
import 'views/catalog_view.dart';
import 'views/cart_view.dart';
import 'views/profile_view.dart';
import 'views/suppliers_view.dart';
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
      title: 'AgriMarket',
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
    const SuppliersView(),
    const CartView(),
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
      body: IndexedStack(index: _currentIndex, children: _screens),
      extendBody: true,
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(16, 0, 16, 14),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.96),
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: AppTheme.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.07),
                blurRadius: 28,
                offset: const Offset(0, 14),
              ),
            ],
          ),
          child: NavigationBarTheme(
            data: NavigationBarThemeData(
              backgroundColor: Colors.transparent,
              indicatorColor: AppTheme.primary.withOpacity(0.14),
              elevation: 0,
              labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
              labelTextStyle: WidgetStateProperty.all(
                const TextStyle(fontWeight: FontWeight.w800, fontSize: 11),
              ),
            ),
            child: NavigationBar(
              selectedIndex: _currentIndex,
              onDestinationSelected: (index) {
                MainNavigation.selectedTabNotifier.value = index;
                setState(() => _currentIndex = index);
              },
              backgroundColor: Colors.transparent,
              surfaceTintColor: Colors.transparent,
              height: 74,
              destinations: const [
                NavigationDestination(
                  icon: Icon(LucideIcons.home),
                  selectedIcon: Icon(LucideIcons.home, color: AppTheme.primary),
                  label: 'Home',
                ),
                NavigationDestination(
                  icon: Icon(LucideIcons.search),
                  selectedIcon: Icon(LucideIcons.search, color: AppTheme.primary),
                  label: 'Explore',
                ),
                NavigationDestination(
                  icon: Icon(LucideIcons.store),
                  selectedIcon: Icon(LucideIcons.store, color: AppTheme.primary),
                  label: 'Suppliers',
                ),
                NavigationDestination(
                  icon: Icon(LucideIcons.shoppingBag),
                  selectedIcon: Icon(LucideIcons.shoppingBag, color: AppTheme.primary),
                  label: 'Cart',
                ),
                NavigationDestination(
                  icon: Icon(LucideIcons.user),
                  selectedIcon: Icon(LucideIcons.user, color: AppTheme.primary),
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
