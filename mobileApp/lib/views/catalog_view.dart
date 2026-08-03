import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/decoration_provider.dart';
import 'item_details_view.dart';

/// Agri Marketplace Color Palette
class AgriTheme {
  static const Color background = Color(0xFFF7F3E8);
  static const Color primary = Color(0xFF1E6F3D);
  static const Color primaryLight = Color(0xFFEAF4E4);
  static const Color accentAmber = Color(0xFFC99728);
  static const Color textDark = Color(0xFF142016);
  static const Color textMuted = Color(0xFF5B665C);
  static const Color cardBg = Colors.white;
  static const Color border = Color(0x1F142016);
}

class CatalogView extends StatefulWidget {
  const CatalogView({super.key});

  @override
  State<CatalogView> createState() => _CatalogViewState();
}

class _CatalogViewState extends State<CatalogView> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = "All";
  bool _isGridView = true;

  // Agricultural Input Categories
  final List<Map<String, dynamic>> _categoriesWithIcons = [
    {"name": "All", "icon": LucideIcons.layoutGrid},
    {"name": "Seeds", "icon": LucideIcons.sprout},
    {"name": "Fertilizers", "icon": LucideIcons.flaskConical},
    {"name": "Pesticides", "icon": LucideIcons.shieldAlert},
    {"name": "Farm Tools", "icon": LucideIcons.wrench},
    {"name": "Irrigation", "icon": LucideIcons.droplets},
    {"name": "Animal Feed", "icon": LucideIcons.wheat},
  ];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _resetFilters() {
    setState(() {
      _selectedCategory = "All";
      _searchController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<DecorationProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Scaffold(
            backgroundColor: AgriTheme.background,
            body: Center(
              child: CircularProgressIndicator(
                color: AgriTheme.primary,
                strokeWidth: 3,
              ),
            ),
          );
        }

        final filteredProducts = provider.decorations.where((item) {
          final matchesCategory =
              _selectedCategory == "All" || item.category == _selectedCategory;
          final matchesSearch = item.name
              .toLowerCase()
              .contains(_searchController.text.trim().toLowerCase());
          return matchesCategory && matchesSearch;
        }).toList();

        return Scaffold(
          backgroundColor: AgriTheme.background,
          appBar: _buildAgriAppBar(),
          body: RefreshIndicator(
            color: AgriTheme.primary,
            onRefresh: () async => _resetFilters(),
            child: CustomScrollView(
              physics: const BouncingScrollPhysics(
                parent: AlwaysScrollableScrollPhysics(),
              ),
              slivers: [
                // Top Search & Category Selection Header
                SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 10),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 18),
                        child: _buildSearchBar(),
                      ),
                      const SizedBox(height: 16),
                      _buildCategoryHorizontalList(),
                      const SizedBox(height: 18),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 18),
                        child: _buildResultsSummaryBar(filteredProducts.length),
                      ),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),

                // Products Display Grid or List
                filteredProducts.isEmpty
                    ? SliverFillRemaining(
                        hasScrollBody: false,
                        child: _buildAgriEmptyState(),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 18),
                        sliver: _isGridView
                            ? _buildAgriGrid(filteredProducts)
                            : _buildAgriList(filteredProducts),
                      ),
                const SliverToBoxAdapter(child: SizedBox(height: 30)),
              ],
            ),
          ),
        );
      },
    );
  }

  /// App Bar tailored for Smart Agri Marketplace
  PreferredSizeWidget _buildAgriAppBar() {
    return AppBar(
      backgroundColor: AgriTheme.background,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text(
            "AgriMarketplace",
            style: TextStyle(
              color: AgriTheme.primary,
              fontWeight: FontWeight.w900,
              fontSize: 22,
              letterSpacing: -0.5,
            ),
          ),
          Text(
            "Smart Input & Mobile Payment Hub",
            style: TextStyle(
              color: AgriTheme.textMuted,
              fontWeight: FontWeight.w500,
              fontSize: 12,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          onPressed: _resetFilters,
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AgriTheme.primaryLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              LucideIcons.rotateCcw,
              size: 18,
              color: AgriTheme.primary,
            ),
          ),
          tooltip: "Reset Filters",
        ),
        const SizedBox(width: 14),
      ],
    );
  }

  /// Smart Search Bar with EVC & Agricultural Filter Prompts
  Widget _buildSearchBar() {
    final hasText = _searchController.text.isNotEmpty;
    return Container(
      decoration: BoxDecoration(
        color: AgriTheme.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: hasText ? AgriTheme.primary : AgriTheme.border,
          width: hasText ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        style: const TextStyle(
          color: AgriTheme.textDark,
          fontWeight: FontWeight.w600,
          fontSize: 14.5,
        ),
        decoration: InputDecoration(
          hintText: "Search seeds, fertilizers, farm tools...",
          hintStyle: const TextStyle(
            color: AgriTheme.textMuted,
            fontSize: 13.5,
            fontWeight: FontWeight.w400,
          ),
          prefixIcon: const Icon(
            LucideIcons.search,
            color: AgriTheme.primary,
            size: 20,
          ),
          suffixIcon: hasText
              ? IconButton(
                  icon: const Icon(LucideIcons.x, size: 18, color: AgriTheme.textMuted),
                  onPressed: () => _searchController.clear(),
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }

  /// Horizontal Scrollable Categories with Lucide Icons
  Widget _buildCategoryHorizontalList() {
    return SizedBox(
      height: 44,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 18),
        itemCount: _categoriesWithIcons.length,
        itemBuilder: (context, index) {
          final cat = _categoriesWithIcons[index];
          final catName = cat["name"] as String;
          final catIcon = cat["icon"] as IconData;
          final isSelected = _selectedCategory == catName;

          return Padding(
            padding: const EdgeInsets.only(right: 10),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              child: InkWell(
                onTap: () => setState(() => _selectedCategory = catName),
                borderRadius: BorderRadius.circular(24),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? AgriTheme.primary : AgriTheme.cardBg,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isSelected ? AgriTheme.primary : AgriTheme.border,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AgriTheme.primary.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            )
                          ]
                        : [],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        catIcon,
                        size: 16,
                        color: isSelected ? Colors.white : AgriTheme.primary,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        catName,
                        style: TextStyle(
                          color: isSelected ? Colors.white : AgriTheme.textDark,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  /// Results Counter and Grid/List Switcher
  Widget _buildResultsSummaryBar(int count) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          "$count Agricultural Inputs Available",
          style: const TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w700,
            color: AgriTheme.textMuted,
          ),
        ),
        Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: AgriTheme.cardBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AgriTheme.border),
              ),
              child: Row(
                children: [
                  IconButton(
                    constraints: const BoxConstraints(minWidth: 34, minHeight: 34),
                    padding: EdgeInsets.zero,
                    onPressed: () => setState(() => _isGridView = true),
                    icon: Icon(
                      LucideIcons.layoutGrid,
                      size: 16,
                      color: _isGridView ? AgriTheme.primary : AgriTheme.textMuted,
                    ),
                  ),
                  Container(width: 1, height: 18, color: AgriTheme.border),
                  IconButton(
                    constraints: const BoxConstraints(minWidth: 34, minHeight: 34),
                    padding: EdgeInsets.zero,
                    onPressed: () => setState(() => _isGridView = false),
                    icon: Icon(
                      LucideIcons.list,
                      size: 16,
                      color: !_isGridView ? AgriTheme.primary : AgriTheme.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  /// Grid Layout using custom Agricultural Cards
  Widget _buildAgriGrid(List dynamicItems) {
    return SliverGrid(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: 0.62, // Optimized ratio for product details
      ),
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          final item = dynamicItems[index];
          return AgriInputProductCard(
            item: item,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => ItemDetailsView(item: item)),
            ),
          );
        },
        childCount: dynamicItems.length,
      ),
    );
  }

  /// List Layout using custom Agricultural Cards
  Widget _buildAgriList(List dynamicItems) {
    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          final item = dynamicItems[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: SizedBox(
              height: 145,
              child: AgriInputHorizontalCard(
                item: item,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => ItemDetailsView(item: item)),
                ),
              ),
            ),
          );
        },
        childCount: dynamicItems.length,
      ),
    );
  }

  /// Empty State Component
  Widget _buildAgriEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(30.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: AgriTheme.primaryLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                LucideIcons.sprout,
                size: 50,
                color: AgriTheme.primary,
              ),
            ),
            const SizedBox(height: 18),
            const Text(
              "No Products Found",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AgriTheme.textDark,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              "We couldn't find any agricultural inputs matching your search criteria or category filter.",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: AgriTheme.textMuted),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _resetFilters,
              icon: const Icon(LucideIcons.refreshCw, size: 16),
              label: const Text("Reset All Filters"),
              style: ElevatedButton.styleFrom(
                backgroundColor: AgriTheme.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}

// ============================================================================
// REDESIGNED AGRICULTURAL PRODUCT CARDS (GRID & LIST)
// ============================================================================

class AgriInputProductCard extends StatelessWidget {
  final dynamic item;
  final VoidCallback onTap;

  const AgriInputProductCard({
    super.key,
    required this.item,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final String title = item.name ?? "Agri Product";
    final String category = item.category ?? "Inputs";
    final dynamic price = item.price;
    final String imageUrl = item.image ?? 'https://via.placeholder.com/300';

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AgriTheme.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AgriTheme.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Section + Stock & Mobile Money Badge
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                  child: AspectRatio(
                    aspectRatio: 1.25,
                    child: Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: AgriTheme.primaryLight,
                        child: const Icon(
                          LucideIcons.image,
                          color: AgriTheme.primary,
                        ),
                      ),
                    ),
                  ),
                ),

                // Category Tag Top Left
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.65),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      category,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),

                // EVC Plus / Mobile Payment Badge Top Right
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(5),
                    decoration: BoxDecoration(
                      color: AgriTheme.cardBg,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    child: const Icon(
                      LucideIcons.smartphone,
                      size: 13,
                      color: AgriTheme.accentAmber,
                    ),
                  ),
                ),
              ],
            ),

            // Details Section
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Verified Supplier Tag
                        Row(
                          children: const [
                            Icon(LucideIcons.badgeCheck,
                                size: 12, color: AgriTheme.primary),
                            SizedBox(width: 4),
                            Text(
                              "Verified Supplier",
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: AgriTheme.primary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AgriTheme.textDark,
                            height: 1.2,
                          ),
                        ),
                      ],
                    ),

                    // Price & Cart Button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Price",
                              style: TextStyle(
                                fontSize: 9.5,
                                color: AgriTheme.textMuted,
                              ),
                            ),
                            Text(
                              "\$$price",
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                color: AgriTheme.primary,
                              ),
                            ),
                          ],
                        ),

                        // Action Button
                        Container(
                          padding: const EdgeInsets.all(7),
                          decoration: BoxDecoration(
                            color: AgriTheme.primary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(
                            LucideIcons.shoppingBag,
                            size: 14,
                            color: Colors.white,
                          ),
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
}

/// Horizontal List Card Design
class AgriInputHorizontalCard extends StatelessWidget {
  final dynamic item;
  final VoidCallback onTap;

  const AgriInputHorizontalCard({
    super.key,
    required this.item,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AgriTheme.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AgriTheme.border),
        ),
        child: Row(
          children: [
            // Image
            ClipRRect(
              borderRadius: const BorderRadius.horizontal(left: Radius.circular(15)),
              child: SizedBox(
                width: 120,
                height: double.infinity,
                child: Image.network(
                  item.image ?? 'https://via.placeholder.com/300',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    color: AgriTheme.primaryLight,
                    child: const Icon(LucideIcons.sprout, color: AgriTheme.primary),
                  ),
                ),
              ),
            ),
            // Details
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              item.category ?? "Inputs",
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AgriTheme.textMuted,
                              ),
                            ),
                            Row(
                              children: const [
                                Icon(LucideIcons.smartphone,
                                    size: 12, color: AgriTheme.accentAmber),
                                SizedBox(width: 3),
                                Text(
                                  "EVC Ready",
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: AgriTheme.accentAmber,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.name ?? "Agri Product",
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AgriTheme.textDark,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "\$${item.price}",
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: AgriTheme.primary,
                          ),
                        ),
                        ElevatedButton.icon(
                          onPressed: onTap,
                          icon: const Icon(LucideIcons.eye, size: 14),
                          label: const Text("View Details", style: TextStyle(fontSize: 12)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AgriTheme.primary,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
