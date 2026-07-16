package com.securevault.repository;

import com.securevault.entity.User;
import com.securevault.entity.VaultItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaultItemRepository extends JpaRepository<VaultItem, Long> {

    List<VaultItem> findByOwnerOrderByUpdatedAtDesc(User owner);

    @Query("SELECT v FROM VaultItem v WHERE v.owner = :owner AND " +
           "(LOWER(v.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.category) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY v.updatedAt DESC")
    List<VaultItem> searchByOwner(@Param("owner") User owner, @Param("search") String search);

    @Query("SELECT DISTINCT v FROM VaultItem v LEFT JOIN VaultShare vs ON vs.vaultItem = v " +
           "WHERE v.owner = :user OR vs.sharedWithEmail = :email " +
           "ORDER BY v.updatedAt DESC")
    List<VaultItem> findAllAccessibleByUser(@Param("user") User user, @Param("email") String email);
}
