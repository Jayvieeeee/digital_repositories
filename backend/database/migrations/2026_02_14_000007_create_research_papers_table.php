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
        Schema::create('research_papers', function (Blueprint $table) {
            $table->id('paper_id');

            $table->foreignId('school_id')->constrained('schools', 'school_id');
            $table->foreignId('student_id')->constrained('students', 'student_id');
            $table->foreignId('adviser_id')->constrained('advisers', 'adviser_id');
            $table->foreignId('academic_year_id')->constrained('academic_years', 'academic_year_id');

            $table->string('title');
            $table->text('abstract');

            $table->enum('document_type', [
                'thesis',
                'capstone',
                'journal',
                'article'
            ]);

            $table->decimal('similarity_percentage', 5, 2)->nullable();
            $table->string('pdf_path');

            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            $table->timestamp('approved_at')->nullable();

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_papers');
    }
};
