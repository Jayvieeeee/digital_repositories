<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('adviser_sections', function (Blueprint $table) {
            $table->id('adviser_section_id');

            $table->foreignId('adviser_id')->constrained('advisers', 'adviser_id')->cascadeOnDelete();
            $table->foreignId('section_id')->constrained('sections', 'section_id')->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years', 'academic_year_id');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adviser_sections');
    }
};
