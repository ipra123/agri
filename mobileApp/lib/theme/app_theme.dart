import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primary = Color(0xFF1B6B42);
  static const Color primaryDark = Color(0xFF134B2E);
  static const Color accent = Color(0xFFD08B2E);
  static const Color background = Color(0xFFF5F1E7);
  static const Color surface = Colors.white;
  static const Color textPrimary = Color(0xFF142016);
  static const Color textSecondary = Color(0xFF5B665C);
  static const Color border = Color(0x1F142016);

  static ThemeData get lightTheme {
    final baseText = GoogleFonts.manropeTextTheme();

    return ThemeData(
      useMaterial3: true,
      splashFactory: InkSparkle.splashFactory,
      visualDensity: VisualDensity.standard,
      iconTheme: const IconThemeData(color: textPrimary, size: 22),
      colorScheme: ColorScheme.light(
        primary: primary,
        secondary: accent,
        surface: surface,
        background: background,
        onPrimary: Colors.white,
        onSurface: textPrimary,
        onBackground: textPrimary,
        outline: border,
      ),
      scaffoldBackgroundColor: background,
      dividerTheme: const DividerThemeData(
        color: Color(0x17142016),
        space: 1,
        thickness: 1,
      ),
      textTheme: baseText.copyWith(
        displayLarge: GoogleFonts.cormorantGaramond(
          color: textPrimary,
          fontWeight: FontWeight.w700,
        ),
        displayMedium: GoogleFonts.cormorantGaramond(
          color: textPrimary,
          fontWeight: FontWeight.w700,
        ),
        headlineLarge: GoogleFonts.cormorantGaramond(
          color: textPrimary,
          fontWeight: FontWeight.w700,
        ),
        titleLarge: GoogleFonts.manrope(
          color: textPrimary,
          fontWeight: FontWeight.w800,
        ),
        titleMedium: GoogleFonts.manrope(
          color: textPrimary,
          fontWeight: FontWeight.w700,
        ),
        bodyLarge: GoogleFonts.manrope(
          color: textPrimary,
          height: 1.45,
        ),
        bodyMedium: GoogleFonts.manrope(
          color: textSecondary,
          height: 1.45,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: background,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        toolbarHeight: 68,
        iconTheme: const IconThemeData(color: textPrimary),
        titleTextStyle: GoogleFonts.manrope(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w800,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          textStyle: GoogleFonts.manrope(
            fontWeight: FontWeight.w800,
            fontSize: 15,
            letterSpacing: 0.2,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textPrimary,
          side: const BorderSide(color: border),
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          textStyle: GoogleFonts.manrope(
            fontWeight: FontWeight.w800,
            fontSize: 15,
          ),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white.withOpacity(0.96),
        elevation: 0,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        indicatorColor: primary.withOpacity(0.12),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return IconThemeData(
            color: selected ? primary : textSecondary,
            size: selected ? 25 : 22,
          );
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return GoogleFonts.manrope(
            fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
            fontSize: 11,
            color: selected ? primary : textSecondary,
          );
        }),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        isDense: true,
        prefixIconColor: textSecondary,
        suffixIconColor: textSecondary,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(color: primary, width: 1.4),
        ),
        labelStyle: GoogleFonts.manrope(color: textSecondary, fontWeight: FontWeight.w700),
        hintStyle: GoogleFonts.manrope(color: textSecondary.withOpacity(0.75)),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: Colors.white,
        disabledColor: Colors.white,
        selectedColor: primary,
        secondarySelectedColor: primary,
        side: const BorderSide(color: border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        labelStyle: GoogleFonts.manrope(fontWeight: FontWeight.w800),
      ),
    );
  }
}
