import 'dart:async';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../widgets/custom_button.dart';
import '../providers/decoration_provider.dart';
import '../models/decoration_model.dart';
import 'item_details_view.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  final PageController _heroController = PageController(viewportFraction: 0.92);
  Timer? _autoScrollTimer;
  int _currentHeroPage = 0;

  final List<Map<String, dynamic>> _heroSlides = [
    {
      "badge": "Trusted Quality",
      "titleStart": "Grow More,\n",
      "titleHighlight": "Sell Smarter",
      "subtitle": "Verified suppliers. Secure mobile money payments.",
      "icon": LucideIcons.leaf,
      "gradient": [const Color(0xFF1B4332), const Color(0xFF2D6A4F)],
      "accent": const Color(0xFF95D5B2),
    },
    {
      "badge": "Fast Delivery",
      "titleStart": "Tools Delivered\n",
      "titleHighlight": "To Your Farm",
      "subtitle": "Order today, receive within 48 hours nationwide.",
      "icon": LucideIcons.truck,
      "gradient": [const Color(0xFF1E3A5F), const Color(0xFF2C5282)],
      "accent": const Color(0xFF90CDF4),
    },
    {
      "badge": "Save More",
      "titleStart": "Bulk Orders,\n",
      "titleHighlight": "Better Prices",
      "subtitle": "Team up with nearby farmers to unlock discounts.",
      "icon": LucideIcons.percent,
      "gradient": [const Color(0xFF5C2E0E), const Color(0xFF9A5B2B)],
      "accent": const Color(0xFFFBD38D),
    },
  ];

  @override
  void initState() {
    super.initState();
    _autoScrollTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (!_heroController.hasClients) return;
      _currentHeroPage = (_currentHeroPage + 1) % _heroSlides.length;
      _heroController.animateToPage(
        _currentHeroPage,
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _heroController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          _buildSliverAppBar(context),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                _buildHeroCarousel(context),
                const SizedBox(height: 30),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: _buildSectionHeader("Categories", onSeeAll: () {}),
                ),
                const SizedBox(height: 16),
                _buildCategoriesList(),
                const SizedBox(height: 30),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: _buildSectionHeader("Featured Inputs", onSeeAll: () {}),
                ),
                const SizedBox(height: 16),
                _buildFeaturedList(context),
                const SizedBox(height: 28),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: _buildSpecialOfferBanner(),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(BuildContext context) {
    return SliverAppBar(
      pinned: true,
      floating: true,
      expandedHeight: 140.0,
      backgroundColor: AppTheme.background,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppTheme.primary,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(color: AppTheme.primary.withOpacity(0.25), blurRadius: 12, offset: const Offset(0, 4)),
              ],
            ),
            child: const Icon(LucideIcons.sprout, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 12),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("AgriMarket", style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w900, fontSize: 20, letterSpacing: -0.5)),
              Text("Verified Agriculture Inputs", style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w500)),
            ],
          ),
        ],
      ),
      actions: [
        Stack(
          children: [
            Container(
              margin: const EdgeInsets.only(right: 16),
              decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: AppTheme.border)),
              child: IconButton(onPressed: () {}, icon: const Icon(LucideIcons.bell, color: AppTheme.textPrimary, size: 20)),
            ),
            Positioned(
              right: 20,
              top: 1,
              child: Container(width: 9, height: 9, decoration: const BoxDecoration(color: Colors.redAccent, shape: BoxShape.circle)),
            ),
          ],
        ),
      ],
      
    );
  }

  /// ============ HERO CAROUSEL — unchanged, this one is staying ============
  Widget _buildHeroCarousel(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 210,
          child: PageView.builder(
            controller: _heroController,
            itemCount: _heroSlides.length,
            onPageChanged: (index) => setState(() => _currentHeroPage = index),
            itemBuilder: (context, index) {
              return AnimatedBuilder(
                animation: _heroController,
                builder: (context, child) {
                  double scale = 1.0;
                  if (_heroController.position.haveDimensions) {
                    final page = _heroController.page ?? _currentHeroPage.toDouble();
                    scale = (1 - ((page - index).abs() * 0.08)).clamp(0.9, 1.0);
                  }
                  return Transform.scale(
                    scale: scale,
                    child: Padding(padding: const EdgeInsets.symmetric(horizontal: 6), child: child),
                  );
                },
                child: _heroSlideCard(_heroSlides[index]),
              );
            },
          ),
        ),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_heroSlides.length, (index) {
            final isActive = index == _currentHeroPage;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 350),
              curve: Curves.easeOut,
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: isActive ? 22 : 6,
              height: 6,
              decoration: BoxDecoration(color: isActive ? AppTheme.primary : AppTheme.border, borderRadius: BorderRadius.circular(10)),
            );
          }),
        ),
      ],
    );
  }

  Widget _heroSlideCard(Map<String, dynamic> slide) {
    final gradient = slide['gradient'] as List<Color>;
    final accent = slide['accent'] as Color;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: gradient[1].withOpacity(0.35), blurRadius: 24, offset: const Offset(0, 12))],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -30,
            top: -30,
            child: Container(width: 140, height: 140, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(0.06))),
          ),
          Positioned(
            right: 10,
            bottom: -40,
            child: Icon(slide['icon'] as IconData, size: 130, color: Colors.white.withOpacity(0.08)),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(22, 20, 22, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.14),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.2)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: accent)),
                      const SizedBox(width: 6),
                      Text(slide['badge'] as String, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
                RichText(
                  text: TextSpan(
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, height: 1.15, color: Colors.white),
                    children: [
                      TextSpan(text: slide['titleStart'] as String),
                      TextSpan(text: slide['titleHighlight'] as String, style: TextStyle(color: accent)),
                    ],
                  ),
                ),
                Row(
                  children: [
                    Expanded(
                      child: Text(slide['subtitle'] as String, maxLines: 2, style: TextStyle(fontSize: 12.5, color: Colors.white.withOpacity(0.85), height: 1.4)),
                    ),
                    const SizedBox(width: 10),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: accent, shape: BoxShape.circle),
                      child: Icon(LucideIcons.arrowUpRight, size: 18, color: gradient[0]),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, {required VoidCallback onSeeAll}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary, letterSpacing: -0.3)),
        GestureDetector(
          onTap: onSeeAll,
          child: const Row(
            children: [
              Text("See All", style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 14)),
              SizedBox(width: 4),
              Icon(LucideIcons.chevronRight, size: 16, color: AppTheme.primary),
            ],
          ),
        ),
      ],
    );
  }

  /// ============ CATEGORIES — NEW design: gradient pill cards, not plain circles ============
  Widget _buildCategoriesList() {
    final categories = [
      {"name": "Seeds", "icon": LucideIcons.sprout, "colors": [const Color(0xFF2D6A4F), const Color(0xFF40916C)]},
      {"name": "Fertilizers", "icon": LucideIcons.flaskConical, "colors": [const Color(0xFF2C5282), const Color(0xFF3182CE)]},
      {"name": "Tools", "icon": LucideIcons.wrench, "colors": [const Color(0xFF9A5B2B), const Color(0xFFC17A3D)]},
      {"name": "Irrigation", "icon": LucideIcons.droplets, "colors": [const Color(0xFF0E7490), const Color(0xFF22A6B3)]},
      {"name": "Livestock", "icon": LucideIcons.beef, "colors": [const Color(0xFF6B46C1), const Color(0xFF8B5CF6)]},
    ];

    return SizedBox(
      height: 108,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: categories.length,
        separatorBuilder: (context, index) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final item = categories[index];
          final colors = item['colors'] as List<Color>;
          return Container(
            width: 92,
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: colors, begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [BoxShadow(color: colors[1].withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 6))],
            ),
            child: Stack(
              children: [
                Positioned(
                  right: -12,
                  bottom: -12,
                  child: Icon(item['icon'] as IconData, size: 56, color: Colors.white.withOpacity(0.15)),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Icon(item['icon'] as IconData, color: Colors.white, size: 22),
                    Text(
                      item['name'] as String,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  /// ============ FEATURED PRODUCTS — NEW: horizontal full-width list cards ============
  Widget _buildFeaturedList(BuildContext context) {
    return Consumer<DecorationProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Center(child: CircularProgressIndicator()),
          );
        }

        if (provider.error.isNotEmpty) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(16)),
              child: Center(child: Text('Error: ${provider.error}', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold))),
            ),
          );
        }

        if (provider.decorations.isEmpty) {
          return const Center(
            child: Padding(padding: EdgeInsets.symmetric(vertical: 24), child: Text('No inputs available right now.')),
          );
        }

        final featured = provider.decorations.take(4).toList();
        final accents = [AppTheme.primary, const Color(0xFF2C5282), const Color(0xFF9A5B2B), const Color(0xFF6B46C1)];

        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          itemCount: featured.length,
          separatorBuilder: (context, index) => const SizedBox(height: 14),
          itemBuilder: (context, index) {
            final item = featured[index];
            final accent = accents[index % accents.length];
            return _productCardHorizontal(context, item, accent);
          },
        );
      },
    );
  }

  Widget _productCardHorizontal(BuildContext context, DecorationModel item, Color accent) {
    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (context) => ItemDetailsView(item: item)));
      },
      child: Container(
        height: 124,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 14, offset: const Offset(0, 5))],
        ),
        child: Row(
          children: [
            // Image left
            ClipRRect(
              borderRadius: const BorderRadius.horizontal(left: Radius.circular(22)),
              child: SizedBox(
                width: 110,
                height: 124,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      item.image ?? 'https://via.placeholder.com/400',
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: accent.withOpacity(0.08),
                        child: Icon(LucideIcons.image, color: accent.withOpacity(0.5)),
                      ),
                    ),
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        width: 5,
                        height: 24,
                        decoration: BoxDecoration(color: accent, borderRadius: BorderRadius.circular(4)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Content right
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(color: accent.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                                child: Text(
                                  item.category,
                                  style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: accent, letterSpacing: 0.3),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                item.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(color: AppTheme.background, shape: BoxShape.circle),
                          child: const Icon(LucideIcons.heart, size: 13, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(LucideIcons.badgeCheck, size: 14, color: accent),
                            const SizedBox(width: 4),
                            Text("Verified seller", style: TextStyle(fontSize: 10.5, color: AppTheme.textSecondary.withOpacity(0.8), fontWeight: FontWeight.w500)),
                          ],
                        ),
                        Row(
                          children: [
                            Text(
                              "\$${item.price}",
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: accent),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: accent,
                                borderRadius: BorderRadius.circular(10),
                                boxShadow: [BoxShadow(color: accent.withOpacity(0.35), blurRadius: 6, offset: const Offset(0, 3))],
                              ),
                              child: const Icon(LucideIcons.plus, size: 14, color: Colors.white),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpecialOfferBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(24)),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("PLANTING SEASON", style: TextStyle(color: Color(0xFF4ADE80), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                const SizedBox(height: 6),
                const Text("Get 20% Off Your First Order", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF1E293B),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  child: const Text("Claim Offer", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.08), shape: BoxShape.circle),
            child: const Icon(LucideIcons.tag, color: Color(0xFF4ADE80), size: 32),
          ),
        ],
      ),
    );
  }
}